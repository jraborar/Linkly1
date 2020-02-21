<?php
/**
 * Created by PhpStorm.
 * User: dan bilauca
 * Date: 07-May-19
 * Time: 01:29 PM
 */

/**
 * Class TVA_Lesson
 */
class TVA_Lesson extends TVA_Post {

	/**
	 * @var array
	 */
	protected $_defaults
		= array(
			'post_type' => TVA_Const::LESSON_POST_TYPE,
		);

	private $_meta_names
		= array(
			'lesson_type',
			'post_media',
			'cover_image',
			'lesson_order',
		);

	/**
	 * @var int $_number in whole list of lessons
	 */
	private $_number;

	public function get_number() {

		if ( empty( $this->_number ) || false === is_int( $this->_number ) ) {

			$lessons = tva_access_manager()->get_course()->get_lessons();

			foreach ( $lessons as $key => $lesson ) {
				if ( $lesson->ID === $this->ID ) {
					$this->_number = $key + 1;
					break;
				}
			}
		}

		return $this->_number;
	}

	/**
	 * Gets the previous post from curse lessons list based on current number
	 *
	 * @return WP_Post|null
	 */
	public function get_previous_lesson() {

		$prev_lesson = null;
		$key         = $this->get_number();

		$key -= 2;

		if ( $this->get_number() > 1 ) {
			$lessons     = tva_access_manager()->get_course()->get_lessons();
			$prev_lesson = isset( $lessons[ $key ] ) ? $lessons[ $key ] : null;
		}

		return $prev_lesson;
	}

	/**
	 * @return WP_Post|null
	 */
	public function get_next_lesson() {

		$key         = $this->get_number();
		$lessons     = tva_access_manager()->get_course()->get_lessons();
		$next_lesson = isset( $lessons[ $key ] ) ? $lessons[ $key ] : null;

		return $next_lesson;
	}

	public function __get( $key ) {

		if ( in_array( $key, $this->_meta_names ) ) {
			return $this->_post->{'tva_' . $key};
		}

		return parent::__get( $key );
	}

	public function get_siblings() {

		if ( $this->post_parent ) {
			//get module or chapter children
			$posts = TVA_Manager::get_children( get_post( $this->post_parent ) );
		} else {
			//get course chapters
			$term  = TVA_Manager::get_post_term( $this->_post );
			$posts = TVA_Manager::get_course_lessons( $term );
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
}
