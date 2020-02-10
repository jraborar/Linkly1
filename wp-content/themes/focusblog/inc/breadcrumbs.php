<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package theme-rise
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden!
}

if ( ! function_exists( 'thrive_breadcrumbs' ) ) :
	/**
	 * Breadcrumbs implementation based on https://developers.google.com/search/docs/data-types/breadcrumb with 'Microdata'
	 */
	function thrive_breadcrumbs() {
		$separator = '<span class="thrive-breadcrumb-separator"> &#8594;</span>';

		/* each breadcrumb item needs a meta tag with the current index; the indexing starts from 0, not 1 */
		$index = 1;

		echo thrive_get_home_root( $separator, $index ) . thrive_get_breadcrumbs( $separator, $index );
	}

	/**
	 * Get the 'Home' part of the breadcrumbs.
	 *
	 * @param string $separator
	 * @param int    $index
	 *
	 * @return string
	 */
	function thrive_get_home_root( $separator, &$index ) {
		$home = __( 'Home', 'thrive' );

		if ( get_option( 'show_on_front' ) === 'page' ) {
			$posts_page_id = get_option( 'page_for_posts' );

			$homepage_id  = get_option( 'page_on_front' );
			$homepage_url = empty( $homepage_id ) ? get_option( 'home' ) : get_page_link( $homepage_id );

			$root = thrive_create_breadcrumb_item( $index, $home . $separator, $homepage_url, 'home' );

			/* add the 'Blog' breadcrumb only if we're on a blog page that is not the homepage */
			if ( ! is_page() && ! empty( $posts_page_id ) ) {
				$title = __( 'Blog', 'thrive' );

				if ( is_home() ) {
					$root .= thrive_create_breadcrumb_item( $index, $title, '', 'no-link' );
				} else {
					/* if it's not home, then we're on the posts page */
					$root .= thrive_create_breadcrumb_item( $index, $title . $separator, get_page_link( $posts_page_id ), 'home' );
				}
			}
		} else {
			$root = thrive_create_breadcrumb_item( $index, $home . $separator, get_option( 'home' ), 'home' );
		}

		return $root;
	}

	/**
	 * Get the breadcrumbs depending on what type of content we're on.
	 *
	 * @param string $separator
	 * @param int    $index
	 *
	 * @return string|void
	 */
	function thrive_get_breadcrumbs( $separator, &$index ) {
		$breadcrumbs = '';

		global $post;

		if ( is_single() ) {
			$categories = get_the_category( $post->ID );

			@usort( $categories, '_usort_terms_by_ID' );

			if ( ! empty( $categories ) && isset( $categories[0] ) ) {
				$first_category = $categories[0];

				$link = get_category_link( $first_category->term_id );

				$breadcrumbs .= thrive_create_breadcrumb_item( $index, $first_category->cat_name . $separator, $link );
			}

			/* add the post itself as the breadcrumb leaf */
			$breadcrumbs .= thrive_create_breadcrumb_item( $index, get_the_title(), '', 'no-link' );

		} elseif ( is_page() ) {
			/* add all the parents of this page as breadcrumbs */
			if ( $post->post_parent ) {
				$ancestors = array_reverse( get_post_ancestors( $post->ID ) );

				foreach ( $ancestors as $ancestor ) {
					$breadcrumbs .= thrive_create_breadcrumb_item( $index, get_the_title( $ancestor ) . $separator, get_page_link( $ancestor ) );
				}
			}
			$breadcrumbs .= thrive_create_breadcrumb_item( $index, get_the_title(), '', 'no-link' );

		} else {
			$archive_title = __( 'Archive', 'thrive' ) . ': ';
			$href          = '';
			$content       = '';

			if ( is_category() || is_tag() || is_tax() ) {
				$content = single_term_title( '', false );
			} elseif ( is_search() ) {
				$content = __( 'Search', 'thrive' ) . ': ';
			} elseif ( is_author() ) {
				$content = __( "Author's Archive", 'thrive' ) . ': ';
			} elseif ( is_day() ) {
				$content = $archive_title . get_the_time( 'F jS, Y' );
			} elseif ( is_month() ) {
				$content = $archive_title . get_the_time( 'F, Y' );
			} elseif ( is_year() ) {
				$content = $archive_title . get_the_time( 'Y' );
			} elseif ( is_archive() || get_query_var( 'paged' ) ) {
				$content = $archive_title;
			}

			if ( ! empty( $content ) ) {
				$breadcrumbs = thrive_create_breadcrumb_item( $index, $content, $href );
			}
		}

		return $breadcrumbs;
	}

	/**
	 * Create a breadcrumb path or leaf item with the given attributes.
	 *
	 * @param int    $index
	 * @param string $title
	 * @param string $href
	 * @param string $class
	 *
	 * @return string
	 */
	function thrive_create_breadcrumb_item( &$index, $title = '', $href = '', $class = '' ) {
		$title = thrive_wrap_content( $title, 'span', '', '', array(
			'itemprop' => 'name',
		) );

		if ( ! empty( $href ) ) {
			$title = thrive_wrap_content( $title, 'a', '', '', array(
				'href'     => $href,
				'itemprop' => 'item',
			) );
		}

		/* meta tag that contains the position of the element */
		$meta = thrive_wrap_content( '', 'meta', '', '', array(
			'content'  => $index ++,
			'itemprop' => 'position',
		) );

		return thrive_wrap_content( $title . $meta, 'li', '', $class, array(
			'itemprop'  => 'itemListElement',
			'itemtype'  => 'https://schema.org/ListItem',
			/* 'null' means that this attribute is added as a key without a value ( like 'nofollow', 'checked', 'disabled' ) */
			'itemscope' => null,
		) );
	}

	/**
	 * Wrap the content in a tag with id, classes, attr
	 *
	 * @param string       $content
	 * @param string       $tag
	 * @param string       $id
	 * @param string|array $class
	 * @param array        $attr
	 *
	 * @return string
	 */
	function thrive_wrap_content( $content, $tag = '', $id = '', $class = '', $attr = array() ) {
		$class = is_array( $class ) ? trim( implode( ' ', $class ) ) : $class;

		if ( empty( $tag ) && ! ( empty( $id ) && empty( $class ) ) ) {
			$tag = 'div';
		}

		$attributes = '';

		foreach ( $attr as $key => $value ) {
			/* if the value is null, only add the key ( this is used for attributes that have no value, such as 'disabled', 'checked', etc ) */
			if ( $value === null ) {
				$attributes .= ' ' . $key;
			} else {
				$attributes .= ' ' . $key . '="' . $value . '"';
			}
		}

		if ( ! empty( $tag ) ) {
			$id_html    = empty( $id ) ? '' : ' id="' . $id . '"';
			$class_html = empty( $class ) ? '' : ' class="' . $class . '"';

			$content = '<' . $tag . $id_html . $class_html . $attributes . '>' . $content . '</' . $tag . '>';
		}

		return $content;
	}

endif;
