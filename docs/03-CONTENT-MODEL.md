# 03 — Content Model

Status: **Living — AUTHORITATIVE**
Last reviewed: 2026-07-22

This document is the single source of truth for the WordPress content schema.
`AGENTS.md` in the backend repository (`C:\Users\manav\Studio\grills`) defers to
this file. If registration code and this document disagree, stop and reconcile —
do not silently pick one.

**No custom-fields plugin is used.** Not ACF (free or PRO), not Meta Box, not
Carbon Fields. All fields are native WordPress post meta, term meta, and a single
option, registered in PHP from `mu-plugins/`. See ADR-0025 in
`12-GLOSSARY-DECISIONS.md`. Admin editing is hand-built with `add_meta_box()`;
see ADR-0026 for the phased approach.

Data lives in standard post types, post meta, term meta, and one option. **No
custom database tables.**

---

## 0. Conventions and Precedence

### 0.1 Naming rules

| Object | Convention | Example |
|---|---|---|
| Post type key | `gotg_` + singular snake_case | `gotg_menu_item` |
| Taxonomy key | `gotg_` + singular snake_case | `gotg_menu_section` |
| Post meta key | `_gotg_` + snake_case | `_gotg_price_variants` |
| Term meta key | `_gotg_` + snake_case | `_gotg_display_order` |
| Option name | `gotg_` + snake_case | `gotg_site_settings` |
| Option array key | snake_case, **unprefixed** | `site_name` |
| Meta box ID | `gotg_` + snake_case + `_box` | `gotg_menu_item_details_box` |
| Nonce action | `gotg_save_` + meta box ID | `gotg_save_gotg_menu_item_details_box` |
| Nonce field name | meta box ID + `_nonce` | `gotg_menu_item_details_box_nonce` |
| Form input name | meta key **without** the leading underscore | `gotg_price_variants` |
| PHP function | `gotg_` + snake_case | `gotg_register_post_types()` |
| API response key | camelCase | `isFeatured` |

**The leading underscore is load-bearing.** A meta key beginning with `_` is
*protected* meta: WordPress hides it from the built-in Custom Fields panel and
refuses to expose or write it through generic meta handling without an explicit
`auth_callback`. Every field in this document is protected, so an editor cannot
reach it except through the meta box built for it.

**Form input names drop the underscore.** `$_POST` keys beginning with an
underscore are legal but easy to mistake for WordPress internals. The save
handler maps `gotg_price_variants` in `$_POST` to `_gotg_price_variants` in
meta. The mapping is explicit in each save handler, never computed by string
concatenation, so a grep for a meta key finds every site that touches it.

Option *array* keys are unprefixed because the option name already namespaces
them and the whole option is read and written as one unit.

### 0.2 REST exposure

WPGraphQL is not installed (ADR-0003), so registrations omit `show_in_graphql`,
`graphql_single_name`, and `graphql_plural_name` entirely — those arguments would
be inert. `AGENTS.md` Rule 3 states the same position; see ADR-0024.

`show_in_rest` is `false` on all custom post types, all taxonomies, **and all
meta registrations**. The frontend never reads `/wp/v2/*`; leaving core REST
exposure on would publish a second, unshaped, unversioned contract alongside
`gotg/v1`. Anonymous access to core REST is additionally denied at the request
level — see `04-API-CONTRACT.md` §9.3. Meta reaches the frontend only through
`gotg/v1` handlers.

**Exception register.** Per `AGENTS.md` Rule 3, `show_in_rest` may be enabled on
an individual post type only when a specific admin feature requires it, and the
exception must be recorded here.

| Object | `show_in_rest` | Reason |
|---|---|---|
| `gotg_menu_item` | `false` | — |
| `gotg_event` | `false` | — |
| `gotg_location` | `false` | — |
| `gotg_block` | `false` | — |
| `gotg_menu_section` | `false` | — |
| `gotg_dietary` | `false` | — |
| All post meta | `false` | — |
| All term meta | `false` | — |

No exceptions are currently granted. Adding a row requires a note stating which
admin feature requires it.

Consequence of `show_in_rest: false` on meta: the block editor cannot read or
write these fields. This is why no custom post type supports `editor` except
`gotg_event`, which uses the classic editor for `post_content` only and stores
nothing else in blocks.

### 0.3 Meta key → camelCase mapping

Every field carries a **Meta Key** (snake_case, underscore-prefixed) and appears
in `04-API-CONTRACT.md` under a camelCase form. The transform is mechanical:
`_gotg_is_featured` → `isFeatured`. Exceptions are called out in the Notes
column. There is no automatic transform in code — each shaper function names its
output keys literally, so the mapping is auditable by reading the shaper.

---

## 1. Object Inventory

| Object | Type | Key | Purpose |
|---|---|---|---|
| Menu Item | CPT | `gotg_menu_item` | One dish or drink |
| Event | CPT | `gotg_event` | One dated event |
| Location | CPT | `gotg_location` | One physical venue |
| Reusable Block | CPT | `gotg_block` | A page block reused across pages |
| Menu Section | Taxonomy | `gotg_menu_section` | Menu grouping (Starters, Sandwiches, BBQ Plates…) |
| Dietary Tag | Taxonomy | `gotg_dietary` | Dietary/allergen marker |
| Page | Core CPT | `page` | The five routed pages, carrying block content |
| Site Settings | Option | `gotg_site_settings` | Global data present in every `_global` object |

---

## 2. Meta Box Implementation Contract

Every meta box in this project satisfies this contract. It is stated once here
and referenced from each post type rather than repeated.

### 2.1 Registration

```php
<?php
/**
 * Registers all project meta boxes.
 *
 * @return void
 */
function gotg_register_meta_boxes() {
	add_meta_box(
		'gotg_menu_item_details_box',
		__( 'Menu Item Details', 'gotg' ),
		'gotg_render_menu_item_details_box',
		'gotg_menu_item',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes', 'gotg_register_meta_boxes' );
```

### 2.2 Render contract

| Requirement | Rule |
|---|---|
| Nonce | Every box outputs `wp_nonce_field( 'gotg_save_{box_id}', '{box_id}_nonce' )` as its first element |
| Labels | Every input has a `<label for>`. No placeholder-as-label. |
| Help text | Rendered in `<p class="description" id="{field}-help">` and referenced by `aria-describedby` on the input |
| Required marking | A visible "(required)" in the label. No bare asterisk. |
| Escaping | `esc_attr()` on every attribute value, `esc_html()` on every text node, `esc_url()` on every URL |
| Current value | Read with `get_post_meta( $post->ID, '_gotg_key', true )` |
| Errors | Rendered inline above the offending field with `role="alert"` — see §2.5 |
| No inline JS | Behaviour comes from an enqueued script; no `onclick` attributes |

### 2.3 Save contract

Every save handler performs these seven checks **in this order**, and returns
early on any failure:

```php
<?php
/**
 * Saves Menu Item Details meta.
 *
 * @param int     $post_id Post being saved.
 * @param WP_Post $post    Post object.
 * @return void
 */
function gotg_save_menu_item_details_box( $post_id, $post ) {
	// 1. Correct post type.
	if ( 'gotg_menu_item' !== $post->post_type ) {
		return;
	}

	// 2. Not an autosave.
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	// 3. Not a revision.
	if ( wp_is_post_revision( $post_id ) ) {
		return;
	}

	// 4. Nonce present and valid.
	$nonce = isset( $_POST['gotg_menu_item_details_box_nonce'] )
		? sanitize_text_field( wp_unslash( $_POST['gotg_menu_item_details_box_nonce'] ) )
		: '';

	if ( '' === $nonce || ! wp_verify_nonce( $nonce, 'gotg_save_gotg_menu_item_details_box' ) ) {
		return;
	}

	// 5. Capability on this specific post.
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	// 6. Validate. Collect errors; do not write invalid values.
	$errors = array();
	$values = gotg_validate_menu_item_input( $_POST, $errors );

	if ( ! empty( $errors ) ) {
		gotg_store_meta_errors( $post_id, $errors );
	}

	// 7. Write only the fields that validated.
	foreach ( $values as $meta_key => $value ) {
		update_post_meta( $post_id, $meta_key, $value );
	}
}
add_action( 'save_post', 'gotg_save_menu_item_details_box', 10, 2 );
```

Rules:

| Rule | Detail |
|---|---|
| Capability check is per-post | `current_user_can( 'edit_post', $post_id )`, never the bare `edit_posts` |
| Nonce is mandatory | A missing nonce is treated as a failure, not as "nothing to save" |
| Absent checkbox | An unchecked checkbox sends no `$_POST` key. Every boolean field is written explicitly as `'0'` when its key is absent, never left at its previous value. |
| Partial writes | A field that fails validation is **not** written. Other fields in the same box still save. The previous value survives. |
| Sanitization is doubled | `sanitize_callback` on `register_post_meta()` is the floor. The save handler sanitizes and validates before calling `update_post_meta()`. Neither is trusted alone. |
| Empty values | An empty optional field calls `delete_post_meta()` rather than writing `''`, so `get_post_meta()` returns `''` and the shaper omits the key — matching ADR-0022 |

### 2.4 Sanitization responsibility

Two layers, both required:

| Layer | Runs when | Responsibility |
|---|---|---|
| `sanitize_callback` on `register_post_meta()` | On every `update_post_meta()` call, from any code path including WP-CLI and the seed script | Type coercion and unconditional cleaning: `sanitize_text_field`, `absint`, `floatval`, array shape normalisation |
| Save handler validation | Only on an admin form submission | Business rules that can *reject*: length limits, ranges, enum membership, cross-field rules such as end-after-start |

A `sanitize_callback` cannot reject a value — returning something different from
what was submitted is its only option, and silently changing an editor's input is
worse than telling them it was wrong. That is why validation is separate.

### 2.5 Validation error surfacing

Errors survive the post-save redirect through a user-scoped transient.

```php
<?php
/**
 * Stores validation errors for display after the save redirect.
 *
 * @param int   $post_id Post ID.
 * @param array $errors  Map of meta key to error message.
 * @return void
 */
function gotg_store_meta_errors( $post_id, array $errors ) {
	set_transient(
		'gotg_meta_errors_' . (int) $post_id . '_' . get_current_user_id(),
		$errors,
		60
	);
}

/**
 * Returns and clears stored validation errors for the current screen.
 *
 * @param int $post_id Post ID.
 * @return array Map of meta key to error message.
 */
function gotg_take_meta_errors( $post_id ) {
	$key    = 'gotg_meta_errors_' . (int) $post_id . '_' . get_current_user_id();
	$errors = get_transient( $key );

	if ( ! is_array( $errors ) ) {
		return array();
	}

	delete_transient( $key );

	return $errors;
}

/**
 * Renders a summary notice listing validation errors.
 *
 * @return void
 */
function gotg_render_meta_error_notice() {
	$screen = get_current_screen();

	if ( ! $screen || 'post' !== $screen->base ) {
		return;
	}

	$post_id = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

	if ( 0 === $post_id ) {
		return;
	}

	$errors = gotg_take_meta_errors( $post_id );

	if ( empty( $errors ) ) {
		return;
	}

	echo '<div class="notice notice-error"><p><strong>';
	esc_html_e( 'Some fields were not saved:', 'gotg' );
	echo '</strong></p><ul>';

	foreach ( $errors as $field => $message ) {
		printf(
			'<li><a href="#%1$s">%2$s</a></li>',
			esc_attr( 'gotg-field-' . $field ),
			esc_html( $message )
		);
	}

	echo '</ul></div>';
}
add_action( 'admin_notices', 'gotg_render_meta_error_notice' );
```

The transient is keyed by both post ID and user ID so two editors working on the
same post never see each other's errors. The 60-second expiry means a stale
error cannot appear on an unrelated later visit.

Each error message is a link to `#gotg-field-{key}`, and each field wrapper in
the meta box carries that `id`, so the summary notice is navigable by keyboard —
the same pattern the frontend contact form uses (`06-COMPONENT-SPEC.md` §5).

### 2.6 Repeating fields

Three fields repeat: `_gotg_price_variants`, `_gotg_regular_hours`,
`_gotg_hours_exceptions`, plus the page-block builder (§8) and several Site
Settings lists (§10). All follow one pattern.

| Aspect | Decision |
|---|---|
| Storage | A single meta key holding an array of associative arrays. WordPress serialises it. |
| Why one key, not indexed keys | `_gotg_price_variants` is read and written as a unit. Indexed keys (`_gotg_price_0_amount`) would require a separate query per row and leave orphans when a row is deleted. |
| Input naming | `gotg_price_variants[0][label]`, `gotg_price_variants[0][amount]` |
| Row template | A `<template>` element in the meta box holding one blank row with `__INDEX__` placeholders |
| Add | JS clones the template, replaces `__INDEX__` with the next integer, appends, moves focus to the first input of the new row |
| Remove | JS removes the row, then announces the removal in a live region. Indices are **not** renumbered in the DOM. |
| Reorder | "Move up" and "Move down" buttons. **No drag-and-drop.** |
| Reindexing | PHP calls `array_values()` on save, so gaps left by removal collapse. The DOM never needs renumbering. |
| Empty state | Zero rows renders the add button plus a "No rows yet" message, not an empty table |

**Drag-and-drop is deliberately excluded.** A drag handle is not keyboard
operable without building a full drag-and-drop accessibility layer (grab, move,
drop announcements, escape to cancel). Two buttons cost nothing and work with a
keyboard, a screen reader, and a touch device. The frontend holds itself to WCAG
2.1 AA (`08-PERFORMANCE-SEO-A11Y.md`); the admin an editor uses daily is held to
the same standard.

Repeater JS contract:

| Requirement | Implementation |
|---|---|
| No framework | Vanilla JS, one file, enqueued only on the screens that need it |
| No build step | Plain ES2017, served as-is |
| Progressive | Without JS, existing rows still render and save; only add/remove/reorder are unavailable |
| Announcements | An `aria-live="polite"` region reports "Row 3 added", "Row 3 removed", "Row 3 moved up" |
| Focus | After add, focus moves to the new row's first input. After remove, focus moves to the add button. After a move, focus stays on the button that was pressed. |
| Move buttons | The first row's "Move up" and the last row's "Move down" are `disabled` |

### 2.7 Media fields

Fields storing an attachment ID (`_gotg_seo_image_id`, `logo_primary_id`, and
the term image) use the WordPress media modal.

| Aspect | Decision |
|---|---|
| Storage | Attachment ID as an integer, in a meta key ending `_id` |
| Picker | `wp_enqueue_media()` in `admin_enqueue_scripts`, then `wp.media()` from the project's admin script |
| Markup | A hidden `<input type="hidden">` holding the ID, a preview `<img>`, a "Choose image" button, and a "Remove image" button |
| Accessibility | Both buttons are real `<button type="button">` elements with text labels. The preview image's `alt` is the attachment's alt text, or empty when none is set. |
| Validation | On save, `wp_attachment_is_image()` must return true for the ID, otherwise the field is rejected with "That file is not an image." |
| Deletion | If the attachment is later deleted, the shaper's `gotg_shape_image()` returns `null` and the key is omitted from the payload — see `04-API-CONTRACT.md` §6.1 |

The featured image (`_thumbnail_id`) uses WordPress's own Featured Image box and
needs none of this.

---

## 3. CPT: `gotg_menu_item`

| Property | Value |
|---|---|
| Singular / Plural | Menu Item / Menu Items |
| Supports | `title`, `thumbnail`, `revisions`, `page-attributes` |
| Hierarchical | `false` |
| Public | `false` |
| `publicly_queryable` | `false` |
| `show_ui` | `true` |
| `show_in_menu` | `true` |
| `show_in_rest` | `false` |
| Has Archive | `false` |
| Rewrite | `false` |
| Menu Icon | `dashicons-food` |
| Menu Position | 21 |
| Taxonomies | `gotg_menu_section`, `gotg_dietary` |
| Capability Type | `post` |

`supports` excludes `editor`: descriptions are a constrained textarea, not free
rich text, because `MenuCard` renders a plain string with no HTML.
`page-attributes` is included to expose `menu_order` for manual ordering within a
section.

`public` is `false` because a menu item has no standalone URL. It is rendered
only as part of `/menu` and `/`.

### 3.1 Registration

```php
<?php
/**
 * Registers the Menu Item post type.
 *
 * @return void
 */
function gotg_register_menu_item_post_type() {
	register_post_type(
		'gotg_menu_item',
		array(
			'labels'              => array(
				'name'          => __( 'Menu Items', 'gotg' ),
				'singular_name' => __( 'Menu Item', 'gotg' ),
				'add_new_item'  => __( 'Add New Menu Item', 'gotg' ),
				'edit_item'     => __( 'Edit Menu Item', 'gotg' ),
				'new_item'      => __( 'New Menu Item', 'gotg' ),
				'view_item'     => __( 'View Menu Item', 'gotg' ),
				'search_items'  => __( 'Search Menu Items', 'gotg' ),
				'not_found'     => __( 'No menu items found.', 'gotg' ),
				'menu_name'     => __( 'Menu Items', 'gotg' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => false,
			'has_archive'         => false,
			'rewrite'             => false,
			'hierarchical'        => false,
			'menu_icon'           => 'dashicons-food',
			'menu_position'       => 21,
			'supports'            => array( 'title', 'thumbnail', 'revisions', 'page-attributes' ),
			'taxonomies'          => array( 'gotg_menu_section', 'gotg_dietary' ),
			'capability_type'     => 'post',
			'map_meta_cap'        => true,
		)
	);
}
add_action( 'init', 'gotg_register_menu_item_post_type' );
```

### 3.2 Fields

| Field Label | Meta Key | Type | Single | Required | Default | Sanitize Callback | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Price Variants | `_gotg_price_variants` | `array` | `true` | Yes | one row, empty label, amount `0` | `gotg_sanitize_price_variants` | 1–6 rows; each `amount` numeric, ≥ 0, ≤ 999, 2 decimals; each `label` ≤ 24 chars; at least one row required | Add one row per size or portion this item is sold in. Most items have a single row — leave its label empty. Use the label for things like "half rack" or "per lb". | API `priceVariants: PriceVariant[]`. See §3.4. |
| Description | `_gotg_description` | `string` | `true` | No | — | `sanitize_textarea_field` | ≤ 240 chars; no HTML | Shown under the item name. One or two sentences. Plain text only. | API `description?: string`. Omitted when empty. |
| Availability | `_gotg_availability` | `array` | `true` | Yes | `["breakfast","lunch","dinner"]` | `gotg_sanitize_daypart_list` | Non-empty; every value in `breakfast`, `lunch`, `dinner` | Which dayparts this item is served. At least one is required. | API `availability: Daypart[]`. Rendered as three checkboxes. |
| Is Featured | `_gotg_is_featured` | `boolean` | `true` | No | `false` | `rest_sanitize_boolean` | — | Featured items appear in the highlights row on the home page. Six are shown at most. | API `isFeatured: boolean`. The six-item cap is enforced at query time, not in the editor. |
| Is Available | `_gotg_is_available` | `boolean` | `true` | No | `true` | `rest_sanitize_boolean` | — | Turn off to hide this item from the site without deleting it. | API: unavailable items are **excluded from the payload entirely**. |
| Spice Level | `_gotg_spice_level` | `string` | `true` | No | `none` | `sanitize_key` | One of `none`, `mild`, `medium`, `hot` | Optional heat indicator. Leave as "None" for items that are not spicy. | API `spiceLevel`. Rendered as a `<select>`. |
| Menu Section | *(taxonomy `gotg_menu_section`)* | — | — | Yes | — | — | Exactly one term — see §7.3 | Which part of the menu this belongs to. | Not meta. Rendered in the side column. |
| Dietary Tags | *(taxonomy `gotg_dietary`)* | — | — | No | — | — | Terms must already exist; new terms cannot be created here | Select all that apply. Leave empty if unsure — do not guess. | Not meta. Rendered as checkboxes; the "Add New" control is removed. |
| Dish Photo | *(core `_thumbnail_id`)* | — | — | No | — | — | ≥ 800×600, JPEG/PNG/WebP, ≤ 5 MB | Landscape photo of the plated item. Not required — items without a photo render as text. | API `image?: ImageObject`, size `gotg_card`. |
| Order Within Section | *(core `menu_order`)* | — | — | No | `0` | — | Integer | Lower numbers appear first within the section. | Set via the relabelled Page Attributes box. |

### 3.3 Meta box specification

| Property | Value |
|---|---|
| Meta box ID | `gotg_menu_item_details_box` |
| Title | Menu Item Details |
| Screen | `gotg_menu_item` |
| Context | `normal` |
| Priority | `high` |
| Fields, in order | Price Variants → Description → Availability → Spice Level → Is Featured → Is Available |
| Nonce action | `gotg_save_gotg_menu_item_details_box` |
| Nonce field | `gotg_menu_item_details_box_nonce` |
| Enqueues | `gotg-repeater.js` (for Price Variants) |

Second box:

| Property | Value |
|---|---|
| Meta box ID | `gotg_menu_item_flags_box` |
| Title | Availability |
| Screen | `gotg_menu_item` |
| Context | `side` |
| Priority | `default` |
| Fields | *(none — this box renders a read-only summary of Is Available and Is Featured for scanning; the editable controls live in the details box)* |

`[ASSUMPTION] The read-only side summary is a convenience for editors scanning a
long form. Drop it if Phase 1 usage shows it is ignored — see ADR-0026.`

### 3.4 Price variants

`_gotg_price_variants` stores an array of rows. Each row is exactly:

```php
array(
	'label'  => 'half rack', // string, may be ''
	'amount' => 29.0,        // float, 2 decimal precision
)
```

A single-priced item stores one row with an empty label:

```php
array(
	array(
		'label'  => '',
		'amount' => 24.0,
	),
)
```

A size-tiered item stores several:

```php
array(
	array(
		'label'  => 'half rack',
		'amount' => 29.0,
	),
	array(
		'label'  => 'full rack',
		'amount' => 46.0,
	),
)
```

**Why this is a repeater from day one, before the client has confirmed variant
pricing.** A scalar `_gotg_price` would be simpler for the common case, and the
real menu (DP-21) is not yet available to prove variants are needed. Building the
repeater up front is deliberate:

| Consideration | Detail |
|---|---|
| The migration cost is asymmetric | Scalar → array requires a data migration across every menu item, a change to the API contract, a change to the TypeScript interfaces, a change to `MenuCard`, and a change to the `MenuItem` JSON-LD offer. Building the array up front costs roughly 0.5 developer-days once. |
| The migration lands at the worst time | Variants would surface during content entry (Phase 5), after 60–100 items already exist and after the frontend is built. That is precisely when a schema change is most expensive. |
| The cost of being wrong is asymmetric | If variants never appear, every item carries one row and the model is mildly over-general. If variants do appear and the model is scalar, the whole chain changes under time pressure. |
| BBQ menus commonly tier by portion | Half and full rack, by the pound, three-meat and two-meat plates. `[ASSUMPTION]` — this is domain reasoning, not client confirmation. DP-21 remains open. |

The editor is not exposed to the generality: a new item starts with one row and
an empty label, and an editor who never adds a second row never sees a variant
concept. This is recorded as ADR-0025's consequence, and it retires risk R-06
from `11-PROJECT-PLAN.md`.

Sanitizer:

```php
<?php
/**
 * Normalises the price variants array.
 *
 * Drops malformed rows, coerces types, reindexes, and caps row count.
 * Rejection of out-of-range values is the validator's job, not this function's.
 *
 * @param mixed $value Raw meta value.
 * @return array Normalised list of variant rows.
 */
function gotg_sanitize_price_variants( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$clean = array();

	foreach ( $value as $row ) {
		if ( ! is_array( $row ) || ! isset( $row['amount'] ) ) {
			continue;
		}

		$label  = isset( $row['label'] ) ? sanitize_text_field( (string) $row['label'] ) : '';
		$amount = round( (float) $row['amount'], 2 );

		$clean[] = array(
			'label'  => $label,
			'amount' => $amount,
		);
	}

	return array_slice( array_values( $clean ), 0, 6 );
}
```

### 3.5 Meta registration

```php
<?php
/**
 * Registers Menu Item post meta.
 *
 * @return void
 */
function gotg_register_menu_item_meta() {
	$post_type = 'gotg_menu_item';

	register_post_meta(
		$post_type,
		'_gotg_price_variants',
		array(
			'type'              => 'array',
			'single'            => true,
			'default'           => array(),
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_price_variants',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_description',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_textarea_field',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_availability',
		array(
			'type'              => 'array',
			'single'            => true,
			'default'           => array( 'breakfast', 'lunch', 'dinner' ),
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_daypart_list',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_is_featured',
		array(
			'type'              => 'boolean',
			'single'            => true,
			'default'           => false,
			'show_in_rest'      => false,
			'sanitize_callback' => 'rest_sanitize_boolean',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_is_available',
		array(
			'type'              => 'boolean',
			'single'            => true,
			'default'           => true,
			'show_in_rest'      => false,
			'sanitize_callback' => 'rest_sanitize_boolean',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);

	register_post_meta(
		$post_type,
		'_gotg_spice_level',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => 'none',
			'show_in_rest'      => false,
			'sanitize_callback' => 'sanitize_key',
			'auth_callback'     => 'gotg_meta_auth_callback',
		)
	);
}
add_action( 'init', 'gotg_register_menu_item_meta' );

/**
 * Authorises reading and writing protected project meta.
 *
 * @param bool   $allowed   Current permission.
 * @param string $meta_key  Meta key.
 * @param int    $object_id Object ID.
 * @return bool Whether the current user may edit this meta.
 */
function gotg_meta_auth_callback( $allowed, $meta_key, $object_id ) {
	return current_user_can( 'edit_post', $object_id );
}

/**
 * Normalises a daypart list to known values.
 *
 * @param mixed $value Raw meta value.
 * @return string[] Valid daypart keys.
 */
function gotg_sanitize_daypart_list( $value ) {
	if ( ! is_array( $value ) ) {
		return array();
	}

	$allowed = array( 'breakfast', 'lunch', 'dinner' );
	$clean   = array_intersect( array_map( 'sanitize_key', $value ), $allowed );

	return array_values( $clean );
}
```

`gotg_meta_auth_callback()` is shared by every post meta registration in this
document and is not repeated in the sections below.

---

## 4. CPT: `gotg_event`

| Property | Value |
|---|---|
| Singular / Plural | Event / Events |
| Supports | `title`, `editor`, `thumbnail`, `revisions`, `excerpt` |
| Hierarchical | `false` |
| Public | `false` |
| `publicly_queryable` | `false` |
| `show_ui` | `true` |
| `show_in_rest` | `false` |
| Has Archive | `false` |
| Rewrite | `false` |
| Menu Icon | `dashicons-calendar-alt` |
| Menu Position | 22 |
| Taxonomies | none |

`public` is `false` even though `/events/[slug]` exists as a frontend route: the
route is rendered by Next.js from the events payload, not by WordPress. The
`post_name` (slug) is still used as the route segment and is returned as `slug`.

`editor` is supported — event descriptions are prose and benefit from paragraphs
and links. Because `show_in_rest` is `false`, this is the **classic** editor, not
the block editor. The API returns sanitised HTML in `descriptionHtml`; see
`04-API-CONTRACT.md` §6.2 for the allowed tag list.

### 4.1 Registration

```php
<?php
/**
 * Registers the Event post type.
 *
 * @return void
 */
function gotg_register_event_post_type() {
	register_post_type(
		'gotg_event',
		array(
			'labels'              => array(
				'name'          => __( 'Events', 'gotg' ),
				'singular_name' => __( 'Event', 'gotg' ),
				'add_new_item'  => __( 'Add New Event', 'gotg' ),
				'edit_item'     => __( 'Edit Event', 'gotg' ),
				'new_item'      => __( 'New Event', 'gotg' ),
				'search_items'  => __( 'Search Events', 'gotg' ),
				'not_found'     => __( 'No events found.', 'gotg' ),
				'menu_name'     => __( 'Events', 'gotg' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => false,
			'has_archive'         => false,
			'rewrite'             => false,
			'hierarchical'        => false,
			'menu_icon'           => 'dashicons-calendar-alt',
			'menu_position'       => 22,
			'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions', 'excerpt' ),
			'capability_type'     => 'post',
			'map_meta_cap'        => true,
		)
	);
}
add_action( 'init', 'gotg_register_event_post_type' );
```

### 4.2 Fields

| Field Label | Meta Key | Type | Single | Required | Default | Sanitize Callback | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Start Date & Time | `_gotg_start_datetime` | `string` | `true` | Yes | — | `gotg_sanitize_datetime` | Parses as a date; format `Y-m-d H:i` | When the event starts. All times are Pacific. | Stored as `Y-m-d H:i` local Pacific. API `startDateTime` is ISO 8601 with offset, computed in the shaper. Input is `<input type="datetime-local">`. |
| End Date & Time | `_gotg_end_datetime` | `string` | `true` | Yes | — | `gotg_sanitize_datetime` | Parses as a date; **must be strictly after** `_gotg_start_datetime` | When the event ends. Used for calendar downloads and for dropping the event from the site. | API `endDateTime`. An event is hidden once this is in the past. |
| Event Type | `_gotg_event_type` | `string` | `true` | Yes | `live_music` | `sanitize_key` | One of `live_music`, `special_menu`, `holiday`, `private`, `other` | Category of event. Drives the icon and label on the event card. | API `eventType`. `private` events are excluded from the payload. |
| Performer Name | `_gotg_performer_name` | `string` | `true` | No | — | `sanitize_text_field` | ≤ 80 chars | Band or artist name. Fill this in for live music events. | API `performerName?`. The meta box shows this field only when Event Type is Live Music — see §4.4. |
| Performer Link | `_gotg_performer_url` | `string` | `true` | No | — | `esc_url_raw` | Valid URL, scheme `https` | Optional link to the performer's site or Instagram. | API `performerUrl?`. Rendered with `rel="noopener noreferrer"`. |
| Short Summary | `_gotg_summary` | `string` | `true` | Yes | — | `sanitize_textarea_field` | 1–160 chars; no HTML | One sentence shown on event cards and used as the search-result description. | API `summary: string`. |
| Ticketed | `_gotg_is_ticketed` | `boolean` | `true` | No | `false` | `rest_sanitize_boolean` | — | Turn on if attendance requires a ticket or a cover charge. | API `isTicketed: boolean`. |
| Ticket / Info URL | `_gotg_ticket_url` | `string` | `true` | No | — | `esc_url_raw` | Valid URL | Where to buy tickets or read more. | API `ticketUrl?`. Shown only when Ticketed is on. |
| Cover Charge | `_gotg_cover_charge` | `number` | `true` | No | — | `gotg_sanitize_money` | ≥ 0, ≤ 999, 2 decimals | Cover charge in USD. Leave empty if free. | API `coverCharge?`. Shown only when Ticketed is on. |
| Is Recurring Instance | `_gotg_is_recurring_instance` | `boolean` | `true` | No | `false` | `rest_sanitize_boolean` | — | Turn on if this is one night of the standing Friday and Saturday live music. | API `isRecurringInstance: boolean`. Prevents duplicating the standing programme card. |
| Event Photo | *(core `_thumbnail_id`)* | — | — | No | — | — | ≥ 1200×800 | Photo of the performer or event. | API `image?: ImageObject`, size `gotg_card`. |
| Description | *(core `post_content`)* | — | — | No | — | `wp_kses` on read | Allowed tags: `p`, `br`, `strong`, `em`, `a`, `ul`, `ol`, `li` | Full description. Keep it short — two or three paragraphs. | API `descriptionHtml?`. Sanitised at shaping time, not at save time, so an allow-list change does not require re-saving posts. |
| Slug | *(core `post_name`)* | — | — | Yes | auto from title | — | Lowercase, hyphenated, unique | The URL for this event, e.g. `/events/the-canyon-band-aug-15`. | API `slug: string`. Include a date qualifier for recurring performers. |

### 4.3 Meta box specification

| Property | Value |
|---|---|
| Meta box ID | `gotg_event_details_box` |
| Title | Event Details |
| Screen | `gotg_event` |
| Context | `normal` |
| Priority | `high` |
| Fields, in order | Start Date & Time → End Date & Time → Event Type → Performer Name → Performer Link → Short Summary → Ticketed → Ticket URL → Cover Charge → Is Recurring Instance |
| Nonce action | `gotg_save_gotg_event_details_box` |
| Nonce field | `gotg_event_details_box_nonce` |
| Enqueues | `gotg-conditional-fields.js` |

### 4.4 Conditional field display

Two groups are shown conditionally. The implementation rule matters:

| Group | Shown when | Mechanism |
|---|---|---|
| Performer Name, Performer Link | Event Type is `live_music` | JS toggles `hidden` on the wrapper `<div>` |
| Ticket URL, Cover Charge | Ticketed is checked | JS toggles `hidden` on the wrapper `<div>` |

Rules:
- Hidden fields are hidden with the `hidden` attribute, which removes them from
  the accessibility tree as well as the visual layout. `display: none` via a
  class is not used, because a class alone can leave the field focusable.
- Hidden fields are **not** disabled and are still submitted. A user who fills in
  a performer, then switches the type to Holiday, does not silently lose the
  value — it stays in meta and reappears if they switch back.
- The shaper decides what reaches the API: `performerName` is omitted from the
  payload when `eventType !== 'live_music'`, regardless of what is stored.
- Without JavaScript every field is visible and editable. Conditional display is
  a convenience, never a validation boundary.

### 4.5 Cross-field validation

The end-after-start rule cannot be expressed in a `sanitize_callback` and lives
in the save handler.

```php
<?php
/**
 * Validates event input and returns the meta values to write.
 *
 * @param array $input  Raw $_POST.
 * @param array $errors Collected errors, by reference.
 * @return array Map of meta key to validated value.
 */
function gotg_validate_event_input( array $input, array &$errors ) {
	$values = array();

	$start = isset( $input['gotg_start_datetime'] )
		? gotg_sanitize_datetime( wp_unslash( $input['gotg_start_datetime'] ) )
		: '';
	$end   = isset( $input['gotg_end_datetime'] )
		? gotg_sanitize_datetime( wp_unslash( $input['gotg_end_datetime'] ) )
		: '';

	if ( '' === $start ) {
		$errors['start_datetime'] = __( 'Enter a start date and time.', 'gotg' );
	} else {
		$values['_gotg_start_datetime'] = $start;
	}

	if ( '' === $end ) {
		$errors['end_datetime'] = __( 'Enter an end date and time.', 'gotg' );
	} elseif ( '' !== $start && strtotime( $end ) <= strtotime( $start ) ) {
		$errors['end_datetime'] = __(
			'The end time must be after the start time.',
			'gotg'
		);
	} else {
		$values['_gotg_end_datetime'] = $end;
	}

	return $values;
}

/**
 * Normalises a datetime-local value to Y-m-d H:i.
 *
 * @param mixed $value Raw value.
 * @return string Normalised datetime, or an empty string when unparseable.
 */
function gotg_sanitize_datetime( $value ) {
	if ( ! is_string( $value ) || '' === trim( $value ) ) {
		return '';
	}

	$timestamp = strtotime( sanitize_text_field( $value ) );

	if ( false === $timestamp ) {
		return '';
	}

	return gmdate( 'Y-m-d H:i', $timestamp );
}
```

When the end time fails validation the start time still saves, per the partial-
write rule in §2.3. The editor sees one error naming one field.

---

## 5. CPT: `gotg_location`

| Property | Value |
|---|---|
| Singular / Plural | Location / Locations |
| Supports | `title`, `revisions` |
| Hierarchical | `false` |
| Public | `false` |
| `show_ui` | `true` |
| `show_in_menu` | `true` |
| `show_in_rest` | `false` |
| Has Archive | `false` |
| Rewrite | `false` |
| Menu Icon | `dashicons-location` |
| Menu Position | 23 |

A single location exists today. The post type exists rather than a settings
section so a second location costs no schema change (`00-PROJECT-BRIEF.md` §6 —
multi-location is a non-goal for UI, not for data). The location surfaced in
`_global.location` is chosen explicitly in Site Settings, not by "first
published".

Registration follows the `gotg_menu_item` pattern with the labels, icon, and
position above.

### 5.1 Fields — address and contact

| Field Label | Meta Key | Type | Single | Required | Default | Sanitize Callback | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Street Address | `_gotg_street_address` | `string` | `true` | Yes | — | `sanitize_text_field` | 1–100 chars | Street number and name only. `[NEEDS CLIENT INPUT]` — DP-01. | API `streetAddress`. Feeds `PostalAddress` schema. |
| Address Line 2 | `_gotg_address_line_2` | `string` | `true` | No | — | `sanitize_text_field` | ≤ 60 chars | Suite, building, or "at Simi Hills Golf Course". | API `addressLine2?`. |
| City | `_gotg_city` | `string` | `true` | Yes | `Simi Valley` | `sanitize_text_field` | 1–60 chars | — | API `city`. |
| State | `_gotg_state` | `string` | `true` | Yes | `CA` | `gotg_sanitize_state` | Exactly 2 chars, `[A-Z]{2}` | Two-letter state code. | API `state`. Uppercased by the sanitizer. |
| Postal Code | `_gotg_postal_code` | `string` | `true` | Yes | — | `sanitize_text_field` | `^\d{5}(-\d{4})?$` | `[NEEDS CLIENT INPUT]` — DP-01. | API `postalCode`. |
| Country | `_gotg_country` | `string` | `true` | Yes | `US` | `gotg_sanitize_state` | Exactly 2 chars | ISO country code. | API `country`. |
| Latitude | `_gotg_latitude` | `number` | `true` | Yes | — | `floatval` | −90 to 90 | Decimal latitude. Copy from Google Maps. | API `latitude`. Feeds `GeoCoordinates` schema and the static map. |
| Longitude | `_gotg_longitude` | `number` | `true` | Yes | — | `floatval` | −180 to 180 | Decimal longitude. | API `longitude`. |
| Phone | `_gotg_phone` | `string` | `true` | Yes | `805-842-2947` | `sanitize_text_field` | `^\d{3}-\d{3}-\d{4}$` | Format as 805-842-2947. | API `phone` (display) and `phoneHref` (`tel:+18058422947`, derived in the shaper). |
| Email | `_gotg_email` | `string` | `true` | No | — | `sanitize_email` | Valid email | Public enquiry address. `[NEEDS CLIENT INPUT]` — DP-18. | API `email?`. |
| Directions URL | `_gotg_directions_url` | `string` | `true` | Yes | — | `esc_url_raw` | Valid URL | Google Maps link used by the "Get Directions" button. | API `directionsUrl`. |
| Parking Note | `_gotg_parking_note` | `string` | `true` | No | — | `sanitize_textarea_field` | ≤ 200 chars; no HTML | Short parking or access instruction shown under the address. | API `parkingNote?`. |
| Timezone | `_gotg_timezone` | `string` | `true` | Yes | `America/Los_Angeles` | `sanitize_text_field` | Must be `America/Los_Angeles` | Do not change. | API `hours.timezone`. Rendered as a disabled input plus a hidden field, so the value is explicit in the payload rather than implied. |

### 5.2 Fields — hours

| Field Label | Meta Key | Type | Single | Required | Default | Sanitize Callback | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Regular Hours | `_gotg_regular_hours` | `array` | `true` | Yes | 7 rows, Mon–Sun 06:00–21:00 | `gotg_sanitize_regular_hours` | Exactly 7 rows, one per weekday, in Monday-first order; `opens` and `closes` match `^\d{2}:\d{2}$`; `closes` after `opens` unless `is_closed` | One row per day. Rows cannot be added or removed. | API `hours.regular`. Fixed-length, so the repeater's add and remove controls are omitted for this field. |
| Hours Exceptions | `_gotg_hours_exceptions` | `array` | `true` | No | `[]` | `gotg_sanitize_hours_exceptions` | ≤ 50 rows; each `date` is `Y-m-d`; each `label` 1–40 chars; times required unless `is_closed` | Holiday and special hours. Add a row for each date that differs from the regular schedule. `[NEEDS CLIENT INPUT]` — DP-09. | API `hours.exceptions`. Full repeater with add, remove, and reorder. |

Row shape for `_gotg_regular_hours` — exactly seven, always present:

```php
array(
	array(
		'day'       => 'monday',
		'opens'     => '06:00',
		'closes'    => '21:00',
		'is_closed' => false,
	),
)
```

Row shape for `_gotg_hours_exceptions`:

```php
array(
	array(
		'date'      => '2026-11-26',
		'label'     => 'Thanksgiving',
		'is_closed' => true,
		'opens'     => '',
		'closes'    => '',
	),
)
```

`opens` and `closes` are stored as empty strings when `is_closed` is true; the
shaper omits them from the payload, matching ADR-0022.

### 5.3 Meta box specification

| Meta box ID | Title | Screen | Context | Priority | Fields |
|---|---|---|---|---|---|
| `gotg_location_address_box` | Address & Contact | `gotg_location` | `normal` | `high` | Street Address, Address Line 2, City, State, Postal Code, Country, Latitude, Longitude, Phone, Email, Directions URL, Parking Note |
| `gotg_location_hours_box` | Opening Hours | `gotg_location` | `normal` | `default` | Regular Hours (7 fixed rows), Hours Exceptions (repeater), Timezone |

`gotg_location_hours_box` enqueues `gotg-repeater.js`. The Regular Hours table
initialises its seven rows on first save if the meta is empty, so an editor never
faces a blank hours table.

---

## 6. CPT: `gotg_block`

| Property | Value |
|---|---|
| Singular / Plural | Reusable Block / Reusable Blocks |
| Supports | `title`, `revisions` |
| Hierarchical | `false` |
| Public | `false` |
| `show_ui` | `true` |
| `show_in_menu` | `true` |
| `show_in_rest` | `false` |
| Has Archive | `false` |
| Rewrite | `false` |
| Menu Icon | `dashicons-screenoptions` |
| Menu Position | 24 |

Holds one page block that appears on more than one page — for example the
"Call to reserve" CTA band shared by `/about` and `/menu`. A page references it
through the `reusable_block` block type (§8). The shaper inlines the referenced
block's content into the page payload, so the frontend never learns that a block
was reusable.

| Field Label | Meta Key | Type | Single | Required | Default | Sanitize Callback | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Block | `_gotg_block` | `array` | `true` | Yes | `[]` | `gotg_sanitize_page_blocks` | Exactly one block; `type` must not be `reusable_block` | The block this entry provides. Choose a type, then fill in its fields. | Stored in the same shape as one entry of `_gotg_page_blocks`. Nesting a reusable block inside a reusable block is rejected at save. |

| Meta box ID | Title | Screen | Context | Priority |
|---|---|---|---|---|
| `gotg_block_content_box` | Block Content | `gotg_block` | `normal` | `high` |

Enqueues `gotg-block-builder.js` with `maxBlocks: 1`.

---

## 7. Taxonomy: `gotg_menu_section`

| Property | Value |
|---|---|
| Singular / Plural | Menu Section / Menu Sections |
| Object types | `gotg_menu_item` |
| Hierarchical | `true` |
| Public | `false` |
| `publicly_queryable` | `false` |
| `show_ui` | `true` |
| `show_admin_column` | `true` |
| `show_in_rest` | `false` |
| Rewrite | `false` |
| Meta box callback | `gotg_render_single_section_meta_box` — radio inputs, not checkboxes |

Hierarchical so a section can nest one level (for example "BBQ" > "Plates",
"BBQ" > "By the Pound"). Nesting deeper than two levels is not supported by
`MenuSection` in `06-COMPONENT-SPEC.md` and must not be created.

`[ASSUMPTION] Initial sections — Breakfast, Starters, Salads, Sandwiches &
Burgers, BBQ Plates, Sides, Desserts, Drinks. Blocked on DP-21; the real menu
governs.`

### 7.1 Registration

```php
<?php
/**
 * Registers the Menu Section taxonomy.
 *
 * @return void
 */
function gotg_register_menu_section_taxonomy() {
	register_taxonomy(
		'gotg_menu_section',
		array( 'gotg_menu_item' ),
		array(
			'labels'             => array(
				'name'          => __( 'Menu Sections', 'gotg' ),
				'singular_name' => __( 'Menu Section', 'gotg' ),
				'add_new_item'  => __( 'Add New Menu Section', 'gotg' ),
				'edit_item'     => __( 'Edit Menu Section', 'gotg' ),
				'menu_name'     => __( 'Menu Sections', 'gotg' ),
			),
			'public'             => false,
			'publicly_queryable' => false,
			'show_ui'            => true,
			'show_admin_column'  => true,
			'show_in_rest'       => false,
			'hierarchical'       => true,
			'rewrite'            => false,
			'meta_box_cb'        => 'gotg_render_single_section_meta_box',
		)
	);
}
add_action( 'init', 'gotg_register_menu_section_taxonomy' );
```

### 7.2 Term meta

| Field Label | Meta Key | Type | Single | Required | Default | Sanitize Callback | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Display Order | `_gotg_display_order` | `integer` | `true` | Yes | `10` | `absint` | 0–999 | Lower numbers appear first on the menu page. Use increments of 10 so sections can be inserted later. | API `order: number`. Ties broken by term name, ascending. |
| Section Intro | `_gotg_intro` | `string` | `true` | No | — | `sanitize_textarea_field` | ≤ 200 chars; no HTML | Optional sentence under the section heading. | API `intro?: string`. |
| Section Image | `_gotg_image_id` | `integer` | `true` | No | `0` | `absint` | Must be an image attachment; ≥ 1200×800 | Optional banner for this section. | API `image?: ImageObject`, size `gotg_card`. Media modal per §2.7. |
| Hide Section | `_gotg_is_hidden` | `boolean` | `true` | No | `false` | `rest_sanitize_boolean` | — | Turn on to hide this whole section from the site without deleting it. | Hidden sections are excluded from the payload. |

Term meta fields are rendered on the Add Term and Edit Term screens via the
`gotg_menu_section_add_form_fields` and `gotg_menu_section_edit_form_fields`
hooks, and saved on `created_gotg_menu_section` and `edited_gotg_menu_section`.
The nonce, capability (`manage_categories`), and validation rules of §2 apply
unchanged, with `current_user_can( 'edit_term', $term_id )` replacing the
per-post capability check.

### 7.3 Single-section cardinality

**A menu item belongs to exactly one menu section.** Two mechanisms enforce this:

1. `meta_box_cb` renders radio inputs instead of the default checkbox list, so
   the admin UI cannot express more than one selection.
2. A `save_post` correction handles WP-CLI, the seed script, and any path that
   bypasses the meta box:

```php
<?php
/**
 * Forces a menu item to hold at most one gotg_menu_section term.
 *
 * @param int $post_id Post being saved.
 * @return void
 */
function gotg_enforce_single_menu_section( $post_id ) {
	if ( 'gotg_menu_item' !== get_post_type( $post_id ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	$terms = wp_get_object_terms( $post_id, 'gotg_menu_section', array( 'fields' => 'ids' ) );

	if ( is_wp_error( $terms ) || count( $terms ) <= 1 ) {
		return;
	}

	wp_set_object_terms( $post_id, array( (int) $terms[0] ), 'gotg_menu_section', false );
}
add_action( 'save_post', 'gotg_enforce_single_menu_section', 20, 1 );
```

An item with **no** section is excluded from the `/menu` payload and flagged in
the admin list table. It is not silently dropped without a signal.

---

## 8. Taxonomy: `gotg_dietary`

| Property | Value |
|---|---|
| Singular / Plural | Dietary Tag / Dietary Tags |
| Object types | `gotg_menu_item` |
| Hierarchical | `false` |
| Public | `false` |
| `show_ui` | `true` |
| `show_admin_column` | `true` |
| `show_in_rest` | `false` |
| Rewrite | `false` |
| Meta box callback | `gotg_render_fixed_dietary_meta_box` — checkboxes over existing terms, no "Add New" control |

Fixed vocabulary. The custom `meta_box_cb` renders checkboxes for existing terms
and omits the free-text "Add New Dietary Tag" field that WordPress shows for
flat taxonomies, so new dietary claims cannot be invented in a hurry. Term
creation remains available on the Dietary Tags admin screen to users with
`manage_categories`.

| Term name | Slug | Meaning |
|---|---|---|
| Vegetarian | `vegetarian` | Contains no meat, poultry, or fish |
| Vegan | `vegan` | Contains no animal products |
| Gluten-Free | `gluten-free` | Prepared without gluten-containing ingredients |
| Contains Nuts | `contains-nuts` | Contains tree nuts or peanuts |
| Spicy | `spicy` | Notably hot |

`[NEEDS CLIENT INPUT] DP-22 — publishing dietary and allergen claims carries
liability. The client must confirm willingness and approve the disclaimer copy
in `menu.disclaimer` before these terms are applied to any item. Until then the
taxonomy ships registered but unpopulated, and DietaryLegend renders nothing.`

### 8.1 Term meta

| Field Label | Meta Key | Type | Single | Required | Default | Sanitize Callback | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Abbreviation | `_gotg_abbreviation` | `string` | `true` | Yes | — | `gotg_sanitize_abbreviation` | 1–3 chars, `[A-Z]` only | Short code shown on menu cards, e.g. "VG", "GF". | API `abbreviation: string`. Uppercased by the sanitizer. |
| Colour | `_gotg_color` | `string` | `true` | Yes | `neutral` | `sanitize_key` | One of `neutral`, `green`, `amber`, `red` | Badge colour. Use red only for allergen warnings. | API `color`. Maps to token pairs in `05-DESIGN-SYSTEM.md` §1.5. |
| Full Description | `_gotg_description_text` | `string` | `true` | Yes | — | `sanitize_textarea_field` | 1–120 chars; no HTML | Explained in the dietary legend at the bottom of the menu. | API `description: string`. Named `_gotg_description_text` to avoid confusion with the core term description, which is unused. |

---

## 9. Page Builder

Applied to the core `page` post type and to `gotg_block`.

### 9.1 Storage

| Property | Value |
|---|---|
| Meta key | `_gotg_page_blocks` |
| Type | `array` |
| Single | `true` |
| Default | `[]` |
| Sanitize callback | `gotg_sanitize_page_blocks` |
| Max blocks | 20 |
| Applies to | `page` |

`gotg_block` uses meta key `_gotg_block` with the same row shape and a maximum of
one block (§6).

Each entry is an associative array whose `type` key names the block. The shaper
emits it as the discriminated union in `04-API-CONTRACT.md` §4; the frontend
switches on `type` in `PageBlockRenderer`.

```php
array(
	array(
		'type'              => 'hero',
		'heading'           => 'Slow-smoked, fairway-side',
		'subheading'        => 'Breakfast through dinner, seven days a week.',
		'eyebrow'           => 'Smoke your birdie',
		'image_id'          => 412,
		'overlay'           => 40,
		'primary_cta_label' => 'View Menu',
		'primary_cta_url'   => '/menu',
	),
	array(
		'type'    => 'text',
		'heading' => 'American classics, Texas patience',
		'body'    => '<p>Marco runs the smoker from four in the morning.</p>',
		'width'   => 'narrow',
		'align'   => 'center',
	),
)
```

### 9.2 Meta box specification

| Property | Value |
|---|---|
| Meta box ID | `gotg_page_blocks_box` |
| Title | Page Blocks |
| Screen | `page` |
| Context | `normal` |
| Priority | `high` |
| Nonce action | `gotg_save_gotg_page_blocks_box` |
| Nonce field | `gotg_page_blocks_box_nonce` |
| Enqueues | `gotg-block-builder.js`, `gotg-repeater.js`, `wp_enqueue_media()` |

Block builder behaviour, extending the repeater contract in §2.6:

| Aspect | Behaviour |
|---|---|
| Add | A `<select>` of permitted block types plus an "Add block" button. Choosing a type and pressing the button appends a collapsed block panel and moves focus to its first input. |
| Permitted types | Filtered per page slug against §9.4. The Menu page's select does not list `people`. |
| Panel | Each block renders as a `<fieldset>` with a `<legend>` naming its type, collapsible via a `<button aria-expanded>` |
| Remove | A "Remove block" button per panel, with a `window.confirm()` guard naming the block type |
| Reorder | "Move up" / "Move down" per panel, per §2.6. No drag-and-drop. |
| Field names | `gotg_page_blocks[0][type]`, `gotg_page_blocks[0][heading]`, … |
| Unknown type on load | A stored block whose `type` is no longer registered renders as a read-only panel showing its raw values and a remove button, rather than being silently dropped |

### 9.3 Block type field tables

Each table's Meta Key column is the key **within** the block's array entry, not a
standalone post meta key.

#### `hero`

| Field Label | Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Heading | `heading` | string | Yes | — | `sanitize_text_field` | 1–60 chars | Main headline. Keep it under 60 characters so it does not wrap awkwardly on mobile. | API `heading`. Rendered as `h1` on Home. |
| Subheading | `subheading` | string | No | — | `sanitize_text_field` | ≤ 120 chars | Optional line under the headline. | API `subheading?`. |
| Eyebrow | `eyebrow` | string | No | — | `sanitize_text_field` | ≤ 30 chars | Small line above the headline, e.g. "Smoke your birdie". | API `eyebrow?`. |
| Background Image | `image_id` | integer | Yes | — | `absint` | Image attachment, ≥ 2400×1350, ≤ 8 MB | Full-width background photo. Landscape, high resolution. | API `image`, size `gotg_hero`. Loaded with `priority`. |
| Overlay Strength | `overlay` | integer | Yes | `40` | `absint` | 0–70, multiple of 10 | Darkens the photo so the text stays readable. Increase if text is hard to read. | API `overlay: number`. Rendered as `<input type="range">`. Contrast is asserted at build — `05-DESIGN-SYSTEM.md` §11. |
| Primary Button Label | `primary_cta_label` | string | Yes | `View Menu` | `sanitize_text_field` | 1–24 chars | — | API `primaryCta.label`. |
| Primary Button Link | `primary_cta_url` | string | Yes | — | `gotg_sanitize_link` | Relative path or absolute URL or `tel:`/`mailto:` | — | API `primaryCta.href` and `primaryCta.isExternal`, derived in the shaper. |
| Secondary Button Label | `secondary_cta_label` | string | No | — | `sanitize_text_field` | ≤ 24 chars | Leave empty to show only one button. | API `secondaryCta?.label`. |
| Secondary Button Link | `secondary_cta_url` | string | No | — | `gotg_sanitize_link` | As above | — | API `secondaryCta?.href`. |

#### `text`

| Field Label | Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Heading | `heading` | string | No | — | `sanitize_text_field` | ≤ 80 chars | Optional section heading. | API `heading?`. Rendered as `h2`. |
| Body | `body` | string | Yes | — | `gotg_kses_block_html` | Non-empty; allowed tags `p`, `br`, `strong`, `em`, `a`, `ul`, `ol`, `li`, `h3` | Section copy. Use headings sparingly. | API `bodyHtml`. Rendered with `wp_editor()` in `teeny` mode, media button disabled. |
| Width | `width` | string | Yes | `narrow` | `sanitize_key` | `narrow` or `wide` | Narrow is easier to read. Use wide only for lists. | API `width`. |
| Alignment | `align` | string | Yes | `left` | `sanitize_key` | `left` or `center` | — | API `align`. |

#### `split_feature`

| Field Label | Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Heading | `heading` | string | Yes | — | `sanitize_text_field` | 1–70 chars | — | API `heading`. |
| Body | `body` | string | Yes | — | `sanitize_textarea_field` | 1–400 chars; no HTML | Two or three sentences. | API `body`. Newlines are preserved and rendered as `<br>` by the frontend. |
| Image | `image_id` | integer | Yes | — | `absint` | Image attachment, ≥ 1200×900 | — | API `image`, size `gotg_card`. |
| Image Side | `image_side` | string | Yes | `left` | `sanitize_key` | `left` or `right` | Which side the photo sits on at desktop width. Photos always stack above text on mobile. | API `imageSide`. |
| Button Label | `cta_label` | string | No | — | `sanitize_text_field` | ≤ 24 chars | Leave empty for no button. | API `cta?.label`. |
| Button Link | `cta_url` | string | No | — | `gotg_sanitize_link` | Relative path or absolute URL | — | API `cta?.href`. |

#### `gallery`

| Field Label | Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Heading | `heading` | string | No | — | `sanitize_text_field` | ≤ 80 chars | — | API `heading?`. |
| Images | `image_ids` | array of integers | Yes | `[]` | `gotg_sanitize_id_list` | 3–12 IDs; each an image attachment ≥ 1200×900 | Between 3 and 12 photos. Every photo needs alt text set in the Media Library. | API `images: ImageObject[]`. Uses the media modal in multi-select mode. |
| Layout | `layout` | string | Yes | `grid` | `sanitize_key` | `grid` or `carousel` | Grid shows everything at once. Carousel saves vertical space but requires interaction. | API `layout`. Carousel must meet the keyboard contract in `06-COMPONENT-SPEC.md`. |

#### `cta_band`

| Field Label | Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Heading | `heading` | string | Yes | — | `sanitize_text_field` | 1–60 chars | — | API `heading`. |
| Body | `body` | string | No | — | `sanitize_text_field` | ≤ 140 chars | One optional supporting line. | API `body?`. |
| Button Label | `cta_label` | string | Yes | — | `sanitize_text_field` | 1–24 chars | — | API `cta.label`. |
| Button Link | `cta_url` | string | Yes | — | `gotg_sanitize_link` | Relative path, absolute URL, or `tel:` | — | API `cta.href`. |
| Style | `style` | string | Yes | `brand` | `sanitize_key` | `brand`, `ink`, or `surface` | Background treatment. | API `style`. |

#### `featured_items`

| Field Label | Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Heading | `heading` | string | Yes | `Off the smoker` | `sanitize_text_field` | 1–60 chars | — | API `heading`. |
| Selection Mode | `mode` | string | Yes | `auto` | `sanitize_key` | `auto` or `manual` | Auto pulls every item marked Featured. Manual lets you pick exact items in order. | Not returned — resolved server-side. |
| Items | `item_ids` | array of integers | No | `[]` | `gotg_sanitize_id_list` | ≤ 6 IDs; each a published `gotg_menu_item` | Pick up to six items, in the order they should appear. | Shown only when Mode is Manual. Rendered as a repeater of `<select>` elements listing published menu items. Resolved to full item objects in the payload. |
| Link Label | `cta_label` | string | No | `See the full menu` | `sanitize_text_field` | ≤ 30 chars | — | API `cta?.label`. |

Relationship: `featured_items.item_ids` → `gotg_menu_item`. Cardinality 0..6.
Direction: page → menu item. No reverse field; a menu item does not know which
page features it.

#### `events_preview`

| Field Label | Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Heading | `heading` | string | Yes | `What's on` | `sanitize_text_field` | 1–60 chars | — | API `heading`. |
| Number to Show | `count` | integer | Yes | `3` | `absint` | 1–6 | How many upcoming events to display. | Resolved server-side; not returned. |
| Link Label | `cta_label` | string | No | `All events` | `sanitize_text_field` | ≤ 30 chars | — | API `cta?.label`. |
| Hide When Empty | `hide_when_empty` | boolean | No | `true` | `rest_sanitize_boolean` | — | When on, this whole block disappears if no events are scheduled. Recommended. | Resolved server-side. The block is omitted from `blocks[]` entirely. |

#### `people`

| Field Label | Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Heading | `heading` | string | No | — | `sanitize_text_field` | ≤ 60 chars | — | API `heading?`. |
| People | `people` | array of rows | Yes | `[]` | `gotg_sanitize_people_rows` | 1–6 rows | One row per person. | API `people[]`. Nested repeater inside the block panel. |
| — Name | `people[].name` | string | Yes | — | `sanitize_text_field` | 1–60 chars | — | API `name`. |
| — Role | `people[].role` | string | Yes | — | `sanitize_text_field` | 1–60 chars | E.g. "Co-owner", "Pitmaster". | API `role`. |
| — Bio | `people[].bio` | string | No | — | `sanitize_textarea_field` | ≤ 400 chars | Two or three sentences. | API `bio?`. |
| — Photo | `people[].photo_id` | integer | No | `0` | `absint` | Image attachment, ≥ 800×800 | Square portrait. | API `photo?`, size `gotg_card`. |

A repeater nested inside a repeater is the most complex piece of admin UI in the
project. It is confined to one block type used on one page.

#### `instagram_feed`

| Field Label | Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Heading | `heading` | string | Yes | `From the grill` | `sanitize_text_field` | 1–60 chars | — | API `heading`. |
| Handle | `handle` | string | Yes | `grillonthegreen_simi` | `sanitize_text_field` | ≤ 30 chars; no leading `@` | Instagram username without the @ symbol. | API `handle`. |
| Post Count | `count` | integer | Yes | `6` | `absint` | 3–12, multiple of 3 | How many posts to show. | API `count`. |

#### `reusable_block`

| Field Label | Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Block | `block_ref_id` | integer | Yes | `0` | `absint` | A published `gotg_block` post ID | Choose a block defined under Reusable Blocks. | Rendered as a `<select>` of published reusable blocks. Resolved server-side; the referenced block's own entry is inlined into `blocks[]` in its place. |

Relationship: `reusable_block.block_ref_id` → `gotg_block`. Cardinality 1..1.
Direction: page → block. Resolution depth 1 — a `reusable_block` inside a
`gotg_block` is rejected at save time with "A reusable block cannot contain
another reusable block."

### 9.4 Permitted blocks per page

Enforced when building the block-type `<select>`, and re-checked on save so a
tampered submission cannot store a disallowed type.

| Page slug | Required | Permitted |
|---|---|---|
| `home` | `hero` | `text`, `split_feature`, `cta_band`, `featured_items`, `events_preview`, `instagram_feed`, `reusable_block` |
| `menu` | none | `text`, `cta_band`, `reusable_block` |
| `events` | none | `text`, `cta_band`, `reusable_block` |
| `about` | none | `text`, `split_feature`, `gallery`, `people`, `cta_band`, `reusable_block` |
| `contact` | none | `text`, `cta_band`, `reusable_block` |

---

## 10. Pages and Per-Page SEO

The five routed pages are core `page` posts, bound to endpoints by slug. Menu,
Events, and Contact supply only their heading, intro, and optional supporting
blocks; their core content (items, events, hours) comes from the respective post
types.

| Page slug | Endpoint |
|---|---|
| `home` | `/gotg/v1/home` |
| `menu` | `/gotg/v1/menu` |
| `events` | `/gotg/v1/events` |
| `about` | `/gotg/v1/about` |
| `contact` | `/gotg/v1/contact` |

### 10.1 SEO meta

Registered for `page` and `gotg_event`.

| Field Label | Meta Key | Type | Single | Required | Default | Sanitize Callback | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|---|
| SEO Title | `_gotg_seo_title` | `string` | `true` | No | — | `sanitize_text_field` | ≤ 60 chars | Shown in Google results. Leave empty to use the page title. | API `seo.title`. Falls back to the post title, then to `_global.seoDefaults.titleTemplate`. A live character counter is rendered beside the field. |
| Meta Description | `_gotg_seo_description` | `string` | `true` | No | — | `sanitize_textarea_field` | ≤ 155 chars; no HTML | The grey text under the title in Google results. Write it as a sentence. | API `seo.description`. Falls back to `_global.seoDefaults.description`. |
| Social Share Image | `_gotg_seo_image_id` | `integer` | `true` | No | `0` | `absint` | Image attachment, ≥ 1200×630 | Shown when the page is shared on Facebook or Instagram. | API `seo.ogImage`. Falls back to `_global.seoDefaults.ogImage`. Media modal per §2.7. |
| Hide from Search Engines | `_gotg_seo_noindex` | `boolean` | `true` | No | `false` | `rest_sanitize_boolean` | — | Turn on to keep this page out of Google. Use only for unfinished pages. | API `seo.noindex`. Emits `robots: noindex, nofollow`. |
| Canonical URL Override | `_gotg_seo_canonical` | `string` | `true` | No | — | `esc_url_raw` | Absolute https URL | Leave empty unless this page duplicates another page. | API `seo.canonical`. |

| Meta box ID | Title | Screen | Context | Priority |
|---|---|---|---|---|
| `gotg_seo_box` | Search & Social | `page`, `gotg_event` | `side` | `low` |

The counter for SEO Title and Meta Description updates in an
`aria-live="polite"` region only at 80% of the limit and above, matching the
frontend `TextArea` rule in `06-COMPONENT-SPEC.md` §5, so it does not announce on
every keystroke.

---

## 11. Site Settings — Option

| Property | Value |
|---|---|
| Option name | `gotg_site_settings` |
| Storage | One option holding an associative array |
| Autoload | `yes` |
| Registered with | `register_setting( 'gotg_site_settings_group', 'gotg_site_settings', … )` |
| Admin page | `add_menu_page()`, slug `gotg-site-settings` |
| Capability | `manage_options` |
| Menu position | 25 |
| Icon | `dashicons-admin-settings` |
| Rendering | Hand-written form, Settings API (`settings_fields()`, `do_settings_sections()`), submitted to `options.php` |

One option rather than many is deliberate: `_global` reads the entire settings
set on every endpoint, so a single autoloaded option is one array fetch rather
than thirty.

```php
<?php
/**
 * Registers the Site Settings option and admin page.
 *
 * @return void
 */
function gotg_register_settings() {
	register_setting(
		'gotg_site_settings_group',
		'gotg_site_settings',
		array(
			'type'              => 'array',
			'default'           => array(),
			'show_in_rest'      => false,
			'sanitize_callback' => 'gotg_sanitize_site_settings',
		)
	);
}
add_action( 'admin_init', 'gotg_register_settings' );

/**
 * Adds the Site Settings admin page.
 *
 * @return void
 */
function gotg_add_settings_page() {
	add_menu_page(
		__( 'Site Settings', 'gotg' ),
		__( 'Site Settings', 'gotg' ),
		'manage_options',
		'gotg-site-settings',
		'gotg_render_settings_page',
		'dashicons-admin-settings',
		25
	);
}
add_action( 'admin_menu', 'gotg_add_settings_page' );
```

The page renders six tabs, switched by a `?tab=` query parameter, each posting
the whole option. `gotg_sanitize_site_settings()` merges the submitted tab's
keys over the stored array so a tab submission never blanks the other tabs'
values.

### 11.1 Tab: Identity

| Field Label | Option Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Site Name | `site_name` | string | Yes | `Grill on the Green` | `sanitize_text_field` | 1–60 chars | Used in page titles and structured data. | API `_global.site.name`. |
| Legal Business Name | `legal_name` | string | Yes | — | `sanitize_text_field` | 1–100 chars | The registered business name, used in the footer copyright and in structured data. `[NEEDS CLIENT INPUT]` — DP-02. | API `_global.site.legalName`. |
| Tagline | `tagline` | string | Yes | `Smoke your birdie` | `sanitize_text_field` | 1–60 chars | Short brand line shown in the footer and hero. | API `_global.site.tagline`. |
| Short Description | `short_description` | string | Yes | — | `sanitize_textarea_field` | 1–200 chars; no HTML | One or two sentences describing the restaurant. Used in the footer and as the default meta description. | API `_global.site.description`. |
| Logo (Primary) | `logo_primary_id` | integer | Yes | `0` | `absint` | Image attachment; SVG or PNG; ≥ 400px wide | Red-on-transparent wordmark for light backgrounds. | API `_global.site.logo`. |
| Logo (Inverse) | `logo_inverse_id` | integer | Yes | `0` | `absint` | Image attachment; ≥ 400px wide | White wordmark for dark backgrounds such as the hero and footer. | API `_global.site.logoInverse`. |
| Favicon Source | `favicon_id` | integer | Yes | `0` | `absint` | PNG, exactly 512×512 | Square icon used for browser tabs. | API `_global.site.favicon`. |
| Primary Location | `primary_location_id` | integer | Yes | `0` | `absint` | A published `gotg_location` post ID | The location shown in the header, footer, and contact page. | Resolved into `_global.location`. Rendered as a `<select>`. |

Relationship: `gotg_site_settings.primary_location_id` → `gotg_location`.
Cardinality 1..1. If unset, every endpoint returns HTTP 500 with code
`gotg_missing_primary_location` — a configuration error, not an empty state.

### 11.2 Tab: Contact & Social

| Field Label | Option Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Social Links | `social_links` | array of rows | No | 1 row (Instagram) | `gotg_sanitize_social_links` | ≤ 6 rows | One row per social profile. | API `_global.social[]`. Repeater per §2.6. |
| — Platform | `social_links[].platform` | string | Yes | `instagram` | `sanitize_key` | One of `instagram`, `facebook`, `yelp`, `google`, `tripadvisor`, `youtube` | — | API `platform`. Determines the icon. |
| — URL | `social_links[].url` | string | Yes | — | `esc_url_raw` | Absolute https URL | Full profile URL including https://. | API `url`. |
| — Handle | `social_links[].handle` | string | No | — | `sanitize_text_field` | ≤ 40 chars | Username without the @ symbol. Used as the accessible link label. | API `handle?`. |
| Contact Form Recipient | `form_recipient_email` | string | Yes | — | `sanitize_email` | Valid email | Where contact form submissions are sent. `[NEEDS CLIENT INPUT]` — DP-18. | **Not exposed in the API.** Server-side only. |
| Reservation URL | `reservation_url` | string | No | — | `esc_url_raw` | Absolute https URL | Link for the Reserve button. Leave empty to hide the button entirely. `[NEEDS CLIENT INPUT]` — DP-04. | API `_global.actions.reservationUrl?`. |
| Online Ordering URL | `ordering_url` | string | No | — | `esc_url_raw` | Absolute https URL | Link for the Order Online button. Leave empty to hide it. `[NEEDS CLIENT INPUT]` — DP-08. | API `_global.actions.orderingUrl?`. |
| Gift Card URL | `gift_card_url` | string | No | — | `esc_url_raw` | Absolute https URL | Leave empty to hide gift card links. `[NEEDS CLIENT INPUT]` — DP-07. | API `_global.actions.giftCardUrl?`. |

### 11.3 Tab: Navigation

| Field Label | Option Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Primary Navigation | `nav_primary` | array of rows | Yes | 4 rows (Menu, Events, About, Contact) | `gotg_sanitize_nav_rows` | 2–5 rows | The main menu. Maximum five items — more will not fit on desktop. | API `_global.navigation.primary[]`. |
| — Label | `nav_primary[].label` | string | Yes | — | `sanitize_text_field` | 1–20 chars | — | API `label`. |
| — Link | `nav_primary[].url` | string | Yes | — | `gotg_sanitize_link` | Relative path or absolute URL | — | API `href`, `isExternal`. |
| Footer Navigation | `nav_footer` | array of rows | Yes | 4 rows | `gotg_sanitize_nav_rows` | 1–8 rows | Links in the footer's Explore column. | API `_global.navigation.footer[]`. |
| — Label | `nav_footer[].label` | string | Yes | — | `sanitize_text_field` | 1–24 chars | — | API `label`. |
| — Link | `nav_footer[].url` | string | Yes | — | `gotg_sanitize_link` | Relative path or absolute URL | — | API `href`, `isExternal`. |
| Header Button Label | `header_cta_label` | string | Yes | `Call 805-842-2947` | `sanitize_text_field` | 1–24 chars | Text of the button at the right of the header. | API `_global.navigation.headerCta.label`. |
| Header Button Link | `header_cta_url` | string | Yes | `tel:8058422947` | `gotg_sanitize_link` | Relative path, absolute URL, or `tel:` | — | API `_global.navigation.headerCta.href`. |
| Announcement Bar Text | `announcement_text` | string | No | — | `sanitize_text_field` | ≤ 100 chars | Optional bar above the header. Leave empty to hide it. | API `_global.announcement?.text`. |
| Announcement Bar Link | `announcement_url` | string | No | — | `gotg_sanitize_link` | Relative path or absolute URL | — | API `_global.announcement?.href`. |
| Announcement Expiry | `announcement_expires` | string | No | — | `gotg_sanitize_date` | `Y-m-d` | The bar stops showing after this date. Leave empty to show it indefinitely. | Evaluated server-side; an expired announcement is omitted from `_global`. |

### 11.4 Tab: SEO Defaults

| Field Label | Option Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Title Template | `seo_title_template` | string | Yes | `%s \| Grill on the Green` | `sanitize_text_field` | ≤ 60 chars; must contain `%s` | `%s` is replaced by the page title. | API `_global.seoDefaults.titleTemplate`. |
| Default Meta Description | `seo_default_description` | string | Yes | — | `sanitize_textarea_field` | 1–155 chars; no HTML | Used on any page without its own description. | API `_global.seoDefaults.description`. |
| Default Social Image | `seo_default_og_image_id` | integer | Yes | `0` | `absint` | Image attachment, ≥ 1200×630 | Used when a page has no social image of its own. | API `_global.seoDefaults.ogImage`. |
| Google Business Profile URL | `google_business_url` | string | No | — | `esc_url_raw` | Absolute https URL | Used in structured data as `sameAs`. | API `_global.seoDefaults.sameAs[]`. |
| Price Range | `price_range` | string | Yes | `$$` | `sanitize_text_field` | One of `$`, `$$`, `$$$`, `$$$$` | Shown in Google's restaurant listings. | API `_global.seoDefaults.priceRange`. |
| Cuisine Types | `cuisine_types` | array of strings | Yes | `["American","Barbecue"]` | `gotg_sanitize_string_list` | 1–5 entries, each ≤ 30 chars | Cuisine labels used in structured data. | API `_global.seoDefaults.servesCuisine[]`. Repeater of single text inputs. |

### 11.5 Tab: Menu Page

| Field Label | Option Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Menu Disclaimer | `menu_disclaimer` | string | Yes | — | `sanitize_textarea_field` | 1–300 chars; no HTML | Shown at the bottom of the menu. Covers price changes and allergen advice. `[NEEDS CLIENT INPUT]` — DP-22. | API `menu.disclaimer`. |
| Show Dietary Legend | `show_dietary_legend` | boolean | No | `true` | `rest_sanitize_boolean` | — | Turn off to hide the dietary key at the bottom of the menu. | API `menu.showDietaryLegend`. |
| Default Daypart | `default_daypart` | string | Yes | `auto` | `sanitize_key` | One of `auto`, `breakfast`, `lunch`, `dinner`, `all` | Which part of the menu opens first. "Auto" picks based on the visitor's local time. | API `menu.defaultDaypart`. |
| Daypart Windows | `daypart_windows` | array of rows | Yes | 3 rows | `gotg_sanitize_daypart_windows` | Exactly 3 rows, one per daypart | Time windows used by the "Auto" setting. | API `menu.dayparts[]`. Fixed-length; add and remove controls omitted. |
| — Daypart | `daypart_windows[].key` | string | Yes | — | `sanitize_key` | One of `breakfast`, `lunch`, `dinner` | — | API `key`. |
| — Label | `daypart_windows[].label` | string | Yes | — | `sanitize_text_field` | 1–20 chars | Shown on the filter button. | API `label`. |
| — Starts | `daypart_windows[].starts` | string | Yes | — | `gotg_sanitize_time` | `^\d{2}:\d{2}$` | — | API `starts`. |
| — Ends | `daypart_windows[].ends` | string | Yes | — | `gotg_sanitize_time` | `^\d{2}:\d{2}$`; after `starts` | — | API `ends`. |

`[ASSUMPTION] Default daypart windows: breakfast 06:00–11:00, lunch 11:00–16:00,
dinner 16:00–21:00. Confirm against actual kitchen practice — DP-21.`

### 11.6 Tab: Events Page

| Field Label | Option Key | Type | Required | Default | Sanitize | Validation | Editor Help Text | Notes |
|---|---|---|---|---|---|---|---|---|
| Show Recurring Programme Card | `show_recurring` | boolean | No | `true` | `rest_sanitize_boolean` | — | Shows the standing "Live music every Friday and Saturday" card at the top of the events page. | API `events.recurring` is `null` when off. |
| Recurring Heading | `recurring_heading` | string | Yes when `show_recurring` | `Live music every Friday & Saturday` | `sanitize_text_field` | 1–60 chars | — | API `events.recurring.heading`. |
| Recurring Body | `recurring_body` | string | Yes when `show_recurring` | — | `sanitize_textarea_field` | 1–300 chars; no HTML | Describe the standing live music programme. | API `events.recurring.body`. |
| Recurring Days | `recurring_days` | array of strings | Yes when `show_recurring` | `["friday","saturday"]` | `gotg_sanitize_weekday_list` | Non-empty; values `monday`…`sunday` | Which nights the standing programme runs. | API `events.recurring.days[]`. Seven checkboxes. |
| Recurring Start Time | `recurring_starts` | string | Yes when `show_recurring` | `18:00` | `gotg_sanitize_time` | `^\d{2}:\d{2}$` | — | API `events.recurring.starts`. |
| Recurring End Time | `recurring_ends` | string | Yes when `show_recurring` | `21:00` | `gotg_sanitize_time` | `^\d{2}:\d{2}$`; after start | — | API `events.recurring.ends`. |
| Empty State Message | `events_empty_message` | string | Yes | `No dated events scheduled right now — live music continues every Friday and Saturday, 6–9pm.` | `sanitize_textarea_field` | 1–200 chars; no HTML | Shown when no upcoming events exist. | API `events.emptyMessage`. |

The five conditional fields are hidden with the `hidden` attribute when
Show Recurring Programme Card is off, following the same rule as §4.4: hidden,
not disabled; still submitted; validated only when the toggle is on.

---

## 12. Relationship Map

| From | Field | To | Cardinality | Direction | Reverse field | Deletion behaviour |
|---|---|---|---|---|---|---|
| `gotg_menu_item` | `gotg_menu_section` terms | `gotg_menu_section` | 1..1 (enforced, §7.3) | item → section | Query by term | Section deleted → item loses its section and is excluded from `/menu` with an admin warning |
| `gotg_menu_item` | `gotg_dietary` terms | `gotg_dietary` | 0..n | item → tag | Query by term | Tag deleted → assignment vanishes; no error |
| `page` | `_gotg_page_blocks[].item_ids` | `gotg_menu_item` | 0..6 | page → item | none | Item deleted → the ID resolves to `null` and is filtered out during shaping |
| `page` | `_gotg_page_blocks[].block_ref_id` | `gotg_block` | 1..1 | page → block | none | Block deleted → the entry is omitted from `blocks[]`; a `WP_DEBUG` notice is logged |
| `page` / `gotg_event` | `_gotg_seo_image_id` | attachment | 0..1 | post → attachment | none | Attachment deleted → `gotg_shape_image()` returns `null`; the shaper falls back to `seoDefaults.ogImage` |
| `gotg_site_settings` | `primary_location_id` | `gotg_location` | 1..1 | settings → location | none | Location deleted → all endpoints return 500 `gotg_missing_primary_location` |
| `gotg_menu_section` | `_gotg_image_id` | attachment | 0..1 | term → attachment | none | Attachment deleted → key omitted from the payload |
| `gotg_event` | — | — | — | — | — | Events reference nothing; `_global.location` supplies the venue |

Rule: **no bidirectional relationships.** Writing both sides on save doubles the
save-hook surface and the revalidation fan-out. Reverse lookups are performed
with `WP_Query` inside shaper functions, which is cheap at this content volume
(fewer than 300 menu items expected).

Referential integrity is not enforced at write time. Nothing prevents an editor
from deleting a menu item referenced by a `featured_items` block. Integrity is
enforced at **read** time in the shapers: a reference that no longer resolves is
dropped from the payload. This is deliberate — a delete-time guard would require
scanning every page's serialised blocks on every deletion, and the read-time
filter is both cheaper and impossible to bypass.

---

## 13. Editor Experience — Phase 1

Phase 1 ships default WordPress edit screens, decluttered. A custom admin
interface is Phase 2 — see ADR-0026 and `11-PROJECT-PLAN.md`.

### 13.1 Admin menu

`menu_position` values produce this order:

```
Dashboard
Pages            (5 routed pages)
Menu Items       (21)
Events           (22)
Locations        (23)
Reusable Blocks  (24)
Site Settings    (25)
Media
Users            (administrators only)
Settings         (administrators only)
```

Removed for non-administrators via `remove_menu_page()` on `admin_menu` at
priority 999:

| Menu | Removed for | Reason |
|---|---|---|
| Posts (`edit.php`) | Everyone | The post type is unused |
| Comments (`edit-comments.php`) | Everyone | Comments are disabled site-wide |
| Tools (`tools.php`) | Non-administrators | Import/export is not an editor task |
| Appearance (`themes.php`) | Non-administrators | The theme is a headless stub with nothing to configure |
| Plugins (`plugins.php`) | Non-administrators | — |
| Settings (`options-general.php`) | Non-administrators | Site Settings is the editor-facing settings screen |
| Users (`users.php`) | Non-administrators | — |

```php
<?php
/**
 * Removes admin menu items that are unused or not editor-facing.
 *
 * @return void
 */
function gotg_declutter_admin_menu() {
	remove_menu_page( 'edit.php' );
	remove_menu_page( 'edit-comments.php' );

	if ( current_user_can( 'manage_options' ) ) {
		return;
	}

	remove_menu_page( 'tools.php' );
	remove_menu_page( 'themes.php' );
	remove_menu_page( 'plugins.php' );
	remove_menu_page( 'options-general.php' );
	remove_menu_page( 'users.php' );
}
add_action( 'admin_menu', 'gotg_declutter_admin_menu', 999 );
```

`remove_menu_page()` hides a screen; it does not revoke the capability. Direct
URL access is blocked by the capability trimming in §13.4, which is the real
control. Menu removal is presentation.

### 13.2 What an editor sees, per screen

#### Editing a Menu Item

1. **Title** — the dish name. Placeholder: "Dish name".
2. **Menu Item Details** (`gotg_menu_item_details_box`, `normal`): Price
   Variants → Description → Availability → Spice Level → Is Featured → Is
   Available.
3. **Menu Section** (`side`) — radio inputs, one selection only.
4. **Dietary Tags** (`side`) — checkboxes over existing terms; no "Add New".
5. **Dish Photo** (`side`) — the core Featured Image box, relabelled.
6. **Order Within Section** (`side`) — the core Page Attributes box, relabelled,
   with the Parent and Template controls removed.

Removed with `remove_meta_box()`: slug, excerpt, comments, trackbacks, custom
fields, author, revisions panel.

The Custom Fields box is removed on every project post type. Because every meta
key is protected (§0.1), it would render empty anyway — removing it prevents an
editor from wondering whether something is missing.

#### Editing an Event

1. **Title** — event name.
2. **Event Details** (`gotg_event_details_box`, `normal`): Start → End → Event
   Type → Performer Name* → Performer Link* → Short Summary → Ticketed →
   Ticket URL† → Cover Charge† → Is Recurring Instance.
3. **Description** — the classic editor, below the details box.
4. **Search & Social** (`gotg_seo_box`, `side`, collapsed by default).
5. **Event Photo** (`side`) — Featured Image, relabelled.
6. **Slug** (`side`) — editable; it is the URL.

\* Shown when Event Type is Live Music. † Shown when Ticketed is on. Both per
§4.4 — hidden, not disabled.

#### Editing a Page

1. **Title** — read-only for the five routed pages.
2. **Page Blocks** (`gotg_page_blocks_box`, `normal`, full width). The block-type
   select is filtered per page slug against §9.4.
3. **Search & Social** (`side`).
4. **Featured Image** — removed. Pages use the `hero` block's image; two
   competing image fields would confuse the editor.

Locked: slug, page template, parent, order, comments. The "Add New Page" button
is removed and deletion is blocked for the five routed pages.

#### Site Settings

Six tabs: Identity → Contact & Social → Navigation → SEO Defaults → Menu Page →
Events Page. Each tab holds roughly eight fields. Requires `manage_options`; an
editor-role user cannot open it.

### 13.3 Roles

A dedicated role is created on plugin activation rather than modifying the stock
Editor role, so an unrelated plugin or a WordPress update cannot silently widen
it.

| Property | Value |
|---|---|
| Role slug | `gotg_editor` |
| Display name | Restaurant Editor |
| Cloned from | `editor`, then trimmed |
| Created | On mu-plugin first load, guarded by a version option so it runs once |

Capabilities granted:

| Capability | Granted | Purpose |
|---|---|---|
| `read` | Yes | Access wp-admin |
| `edit_posts`, `edit_published_posts`, `edit_others_posts` | Yes | Required by `map_meta_cap` for the custom post types |
| `publish_posts` | Yes | Publish menu items and events |
| `delete_posts`, `delete_published_posts` | Yes | Remove obsolete menu items |
| `upload_files` | Yes | Add dish and event photos |
| `edit_pages`, `edit_published_pages`, `edit_others_pages` | Yes | Edit the five routed pages |
| `publish_pages` | **No** | Pages are fixed; nothing new is published |
| `delete_pages` | **No** | The five routed pages must not be deletable |
| `manage_categories` | Yes | Manage menu sections |
| `manage_options` | **No** | Site Settings is administrator-only |
| `edit_theme_options` | **No** | — |
| `install_plugins`, `activate_plugins`, `edit_files` | **No** | — |
| `list_users`, `create_users`, `edit_users` | **No** | — |
| `moderate_comments` | **No** | Comments are disabled |

| Role | Menu Items | Events | Locations | Reusable Blocks | Pages | Site Settings |
|---|---|---|---|---|---|---|
| Administrator | Full | Full | Full | Full | Edit only | Full |
| `gotg_editor` | Full | Full | Read | Edit | Edit only | No access |

`[ASSUMPTION] Two roles suffice: an Administrator (agency or owner) and a
Restaurant Editor (staff updating menu and events). Confirm against DP-15.`

### 13.4 Editor guardrails implemented in code

| Guardrail | Mechanism |
|---|---|
| Cannot create or delete the five routed pages | `map_meta_cap` filter denying `delete_page` for those IDs, and `publish_pages`/`delete_pages` withheld from `gotg_editor` |
| Cannot reach a hidden admin screen by URL | Capabilities are withheld, not just menu items hidden (§13.3) |
| Cannot assign two menu sections | Radio `meta_box_cb` plus the `save_post` correction (§7.3) |
| Cannot save an event ending before it starts | Save-handler validation with an inline error (§4.5) |
| Cannot store a block type a page does not permit | The select is filtered, and the type is re-checked on save against §9.4 |
| Cannot nest a reusable block inside a reusable block | Rejected at save with a named error (§9.3) |
| Cannot invent a dietary term while editing an item | Custom `meta_box_cb` omits the "Add New" control |
| Cannot leave a menu item sectionless without noticing | Admin list-table column "Section" with a red "Not on menu" badge, plus a dashboard notice counting such items |
| Cannot upload an image below the minimum dimensions | `wp_handle_upload_prefilter` rejecting undersized uploads with a message naming the required size |
| Cannot publish an image without alt text | Admin notice listing attached images missing alt text; a warning, not a hard block |
| Cannot save a price variant outside 0–999 | Save-handler validation with an inline error |
| Cannot silently lose data to a failed save | Partial-write rule (§2.3): valid fields save, invalid fields keep their previous value, and every rejection is named |

---

## 14. Content Volume Expectations

Sizing informs query limits and caching, not editorial policy.

| Object | Expected count at launch | Ceiling before pagination is needed |
|---|---|---|
| `gotg_menu_item` | 60–100 | 300 |
| `gotg_menu_section` | 8–12 | 25 |
| `gotg_dietary` | 5 | 12 |
| `gotg_event` | 4–12 upcoming | 50 upcoming |
| `gotg_location` | 1 | — |
| `gotg_block` | 2–4 | 20 |
| Price variants per item | 1 | 6 |

The `/menu` endpoint returns every item in one response. At 300 items with full
field data the payload is roughly 180 KB uncompressed, ~25 KB gzipped — well
inside budget. Pagination is deliberately not implemented; revisit only if the
item count exceeds the ceiling.

Meta reads are batched: every shaper calls `update_meta_cache()` once for the
full post ID set before reading individual keys, so a 300-item menu costs one
meta query rather than 1,800.
