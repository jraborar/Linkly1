<?php
/**
 * Created by PhpStorm.
 * User: dan bilauca
 * Date: 30-May-19
 * Time: 01:49 PM
 */

/**
 * Class TVA_Post
 * - wrapper over WP_Post so it can help saving data and metas for a post
 * - sets order and course to a post
 * - saves a post
 *
 * @property int    ID
 * @property int    course_id
 * @property string order
 * @property array  item_ids used for grouping into chapters
 * @property int    post_parent
 * @property string post_status
 */
class TVA_Post {

	protected $_defaults
		= array(
			'post_type' => 'post',
		);

	/**
	 * @var WP_Post
	 */
	protected $_post;

	/**
	 * @var array
	 */
	protected $_data = array();

	/**
	 * TVA_Post constructor.
	 *
	 * @param array|WP_Post|int $data
	 */
	public function __construct( $data ) {

		if ( true === $data instanceof WP_Post ) {
			$this->_post = $data;
		}

		if ( true === is_array( $data ) ) {
			$this->_data = $data;
		}

		if ( is_int( $data ) ) {
			$data = array(
				'ID' => $data,
			);
		}

		$this->_data = wp_parse_args( $data, $this->_defaults );

		if ( $this->ID ) {
			$this->_post = get_post( $this->ID );
		}
	}

	/**
	 * Returns values from
	 * - calling method if exists
	 * - _data
	 * - _post
	 *
	 * @param $key
	 *
	 * @return mixed|null
	 */
	public function __get( $key ) {

		$value = null;

		if ( method_exists( $this, $key ) ) {
			return $this->$key();
		}

		if ( isset( $this->_data[ $key ] ) ) {
			$value = $this->_data[ $key ];
		} elseif ( true === $this->_post instanceof WP_Post ) {
			$value = $this->_post->$key;
		}

		return $value;
	}

	/**
	 * Set values into _data
	 * - updates order
	 * - assigns course to current post
	 * - updates _post for ID key
	 *
	 * @param $key
	 * @param $value
	 */
	public function __set( $key, $value ) {

		if ( $key === 'order' ) {
			$this->set_order( $value );

			return;
		}

		if ( $key === 'course_id' ) {
			$this->assign_to_course( $value );

			return;
		}

		if ( is_string( $key ) ) {
			$this->_data[ $key ] = $value;
		}

		if ( $key === 'ID' ) {
			$this->_post = get_post( $value );
		}
	}

	/**
	 * Based on _post->post_type saves a post meta
	 *
	 * @param string $order
	 *
	 * @return bool
	 */
	public function set_order( $order ) {

		$set = false;

		$this->_data['order'] = $order;

		if ( true === $this->_post instanceof WP_Post ) {
			update_post_meta( $this->ID, $this->_post->post_type . '_order', $order );
			$set = true;
		}

		return $set;
	}

	public function get_order() {

		$order = '';

		if ( true === $this->_post instanceof WP_Post ) {
			$order = $this->_post->{$this->_post->post_type . '_order'};
		}

		return $order;
	}

	/**
	 * Update the post or inset the data as post
	 * - updates the order
	 * - assign to a course
	 *
	 * @return bool
	 * @throws Exception
	 */
	public function save() {

		if ( $this->ID ) {
			$result = wp_update_post( $this->_data );
		} else {
			$result = wp_insert_post( $this->_data );
		}

		if ( is_wp_error( $result ) ) {
			throw new Exception( $result->get_error_message(), $result->get_error_code() );
		}

		$this->_post = get_post( $result );

		if ( $this->course_id ) {
			$this->assign_to_course( $this->course_id );
		}

		if ( isset( $this->_data['order'] ) ) {
			$this->set_order( $this->order );
		}

		return true;
	}

	/**
	 * Assign current _post to a course term
	 *
	 * @param int|WP_Term $course
	 *
	 * @return bool
	 */
	public function assign_to_course( $course ) {

		$course_id = null;

		if ( true === $course instanceof WP_Term ) {
			$course_id = $course->term_id;
		} else {
			$course_id = (int) $course;
		}

		$result = $this->_assign_post_to_course( $this->_post, $course_id );

		return false === is_wp_error( $result );
	}

	/**
	 * Assign a post and its children to a course
	 *
	 * @param $post
	 * @param $course_id
	 *
	 * @return bool
	 */
	private function _assign_post_to_course( $post, $course_id ) {

		$result = wp_set_object_terms( $post->ID, $course_id, TVA_Const::COURSE_TAXONOMY );

		if ( false === is_wp_error( $result ) ) {

			$children = TVA_Manager::get_children( $post );

			foreach ( $children as $child ) {
				$result = $this->_assign_post_to_course( $child, $course_id );
			}
		}

		return false === is_wp_error( $result );
	}

	/**
	 * Factory an instance based on $post_type
	 *
	 * @param WP_Post $post
	 *
	 * @return TVA_Post
	 */
	public static function factory( $post ) {

		$class_name = 'TVA_Post';
		$type       = '';

		if ( true === $post instanceof WP_Post ) {
			$type = $post->post_type;
		}

		switch ( $type ) {
			case TVA_Const::LESSON_POST_TYPE:
				$class_name = 'TVA_Lesson';
				break;
			case TVA_Const::CHAPTER_POST_TYPE:
				$class_name = 'TVA_Chapter';
				break;
			case TVA_Const::MODULE_POST_TYPE:
				$class_name = 'TVA_Module';
				break;
		}

		return new $class_name( $post );
	}

	public function get_siblings() {
		return array();
	}

	public function get_direct_children() {
		return array();
	}

	/**
	 * @return WP_Post|null
	 */
	public function get_the_post() {

		return $this->_post;
	}

	/**
	 * Factory a parent based on current post's post_parent
	 *
	 * @return TVA_Post
	 */
	public function get_parent() {

		return self::factory( get_post( $this->_post ? $this->_post->post_parent : null ) );
	}

	public function delete( $force = false ) {

		$siblings     = $this->get_siblings();
		$tva_parent   = $this->get_parent();
		$parent_order = $tva_parent->get_order();
		$deleted      = false;

		/**
		 * Review order of post's siblings
		 *
		 * @var TVA_Post $sibling
		 */
		foreach ( $siblings as $key => $sibling ) {
			$new_order = $parent_order . $key;
			$sibling->set_order( $new_order );
			TVA_Manager::review_children_order( $sibling->get_the_post() );
		}

		if ( true === $this->_post instanceof WP_Post ) {
			$deleted = (bool) wp_delete_post( $this->_post->ID, $force );
		}

		if ( $deleted ) {
			TVA_Manager::review_status( $tva_parent->get_the_post() );
			$this->_delete_children();
		}

		return $deleted;
	}

	private function _delete_children() {
		/**
		 * delete lessons
		 */
		$children = TVA_Manager::get_children( $this->_post );
		/** @var WP_Post $child */
		foreach ( $children as $child ) {
			$child = self::factory( $child );
			$child->delete();
		}
	}
}
