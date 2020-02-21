<?php
/**
 * Created by PhpStorm.
 * User: dan bilauca
 * Date: 29-May-19
 * Time: 01:55 PM
 */

/**
 * Class TVA_Chapter
 */
class TVA_Chapter extends TVA_Post {

	/**
	 * @var array
	 */
	protected $_defaults
		= array(
			'post_type' => TVA_Const::CHAPTER_POST_TYPE,
		);

	public function get_siblings() {

		if ( $this->post_parent ) {
			//get module children
			$posts = TVA_Manager::get_module_chapters( get_post( $this->post_parent ) );
		} else {
			//get course chapters
			$term  = TVA_Manager::get_post_term( $this->_post );
			$posts = TVA_Manager::get_course_chapters( $term );
		}

		$siblings = array();

		/** @var WP_Post $item */
		foreach ( $posts as $key => $item ) {
			if ( $item->ID !== $this->_post->ID ) {
				$siblings[] = TVA_Post::factory( $item );
			}
		}

		return $siblings;
	}

	public function get_direct_children() {

		$tva_lessons = array();

		/** @var WP_Post $item */
		foreach ( TVA_Manager::get_chapter_lessons( $this->_post ) as $item ) {
			$tva_lessons[] = TVA_Post::factory( $item );
		}

		return $tva_lessons;
	}
}
