<?php
/**
 * Thrive Themes - https://thrivethemes.com
 *
 * @package thrive-apprentice
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Silence is golden
}

$data = array(
	array(
		'name'        => 'Thrive Themes - Make More Sales Without Needing More Traffic',
		'args'        => array(
			'description' => __( 'Learn the most reliable method we\'ve ever found, to increase conversion rates.', TVA_Const::T ),
		),
		'cover_image' => TVA_Const::plugin_url( 'img/default_cover.png' ),
		'level'       => 0,
		'logged_in'   => 1,
		'roles'       => array(),
		'topic'       => 0,
		'status'      => 'private',
		'order'       => 4,
		'modules'     => array(
			array(
				'args'     => array(
					'post_title'   => __( 'Learn how to use Scarcity Marketing', TVA_Const::T ),
					'post_type'    => TVA_Const::MODULE_POST_TYPE,
					'post_excerpt' => __( 'In this module, we introduce the concept of scarcity marketing. It is tricky, if you do it right, it’s incredibly powerful. But if you do it wrong, it can cost you dearly and damage your reputation.', TVA_Const::T ),
					'post_status'  => 'publish',
				),
				'order'    => 0,
				'chapters' => array(
					array(
						'args'    => array(
							'post_title'  => __( 'Scarcity Marketing Secrets', TVA_Const::T ),
							'post_type'   => TVA_Const::CHAPTER_POST_TYPE,
							'post_status' => 'publish',
						),
						'order'   => 0,
						'lessons' => array(
							array(
								'args'         => array(
									'post_title'   => __( 'Intro & Proof', TVA_Const::T ),
									'post_type'    => TVA_Const::LESSON_POST_TYPE,
									'post_excerpt' => __( 'To start with, we’ll take a look at some proof. That way, you’ll see that the recipes in this course actually work (and produce some impressive results) in the real world and aren’t just marketing theory.', TVA_Const::T ),
									'post_status'  => 'publish',
								),
								'lesson_type'  => 'text',
								'lesson_order' => 0,
								'status'       => 1,
							),
							array(
								'args'         => array(
									'post_title'   => __( 'Scarcity Marketing – Good & Bad Examples', TVA_Const::T ),
									'post_type'    => TVA_Const::LESSON_POST_TYPE,
									'post_excerpt' => __( 'In this lesson, we introduce the concept of scarcity marketing. And very importantly: we look at some examples of how not to do it and the principles for doing it right. Scarcity marketing is tricky in this regard. If you do it right, it’s incredibly powerful. But if you do it wrong, it can cost you dearly and damage your reputation.', TVA_Const::T ),
									'post_status'  => 'publish',
								),
								'lesson_type'  => 'text',
								'lesson_order' => 1,
								'status'       => 1,
							),
						),
					),
				),
			),
			array(
				'args'    => array(
					'post_title'   => __( 'Putting Scarcity Marketing Into Practice', TVA_Const::T ),
					'post_type'    => TVA_Const::MODULE_POST_TYPE,
					'post_excerpt' => __( 'In this module, we get very practical: you’ll see exactly how we apply various countdowns and time limits on a website. No matter what your website and your promotion are about, you can follow along with these steps to create your own campaign.', TVA_Const::T ),
					'post_status'  => 'publish',
				),
				'order'   => 1,
				'lessons' => array(
					array(
						'args'         => array(
							'post_title'   => __( 'Behind the Scenes: Our Exact Scarcity Marketing Sequence', TVA_Const::T ),
							'post_type'    => TVA_Const::LESSON_POST_TYPE,
							'post_excerpt' => __( 'Continuing the theme of keeping it real, in this video we take a look at the exact scarcity marketing sequence we used on one of our product launches. And by exact, I mean: you’ll see the actual emails we sent, the exact timings of when we sent them and the sales results corresponding to them.', TVA_Const::T ),
							'post_status'  => 'publish',
						),
						'lesson_type'  => 'text',
						'lesson_order' => 0,
						'status'       => 1,
					),
					array(
						'args'         => array(
							'post_title'   => __( 'Two Scarcity Marketing Recipes', TVA_Const::T ),
							'post_type'    => TVA_Const::LESSON_POST_TYPE,
							'post_excerpt' => __( 'In this short lesson, we introduce two recipes you can apply to your business: the “under the radar” promotion and the classic product launch or sale. You’ll see the exact steps and timings required to make these promotions as effective as possible.', TVA_Const::T ),
							'post_status'  => 'publish',
						),
						'lesson_type'  => 'text',
						'lesson_order' => 1,
						'status'       => 1,
					),
				),
			),
		),
	),
	array(
		'name'        => 'Thrive Themes - From Internet Rubbish to Content Gold',
		'args'        => array(
			'description' => __( 'How to improve your content marketing so you can stand out from all the rubbish content out there', TVA_Const::T ),
		),
		'cover_image' => TVA_Const::plugin_url( 'img/default_cover.png' ),
		'level'       => 0,
		'logged_in'   => 1,
		'roles'       => array(),
		'topic'       => 0,
		'order'       => 3,
		'status'      => 'private',
		'lessons'     => array(
			array(
				'args'         => array(
					'post_title'   => __( 'Introduction – From Internet Rubbish to Content Marketing Gold', TVA_Const::T ),
					'post_type'    => TVA_Const::LESSON_POST_TYPE,
					'post_excerpt' => __( 'Why is it so hard to create engaging content? And what is engaging content actually? Discover what you’ll need to learn in order to make your content marketing efficient', TVA_Const::T ),
					'post_status'  => 'publish',
				),
				'lesson_type'  => 'text',
				'lesson_order' => 0,
				'status'       => 1,
			),
			array(
				'args'         => array(
					'post_title'   => __( 'Why Most Internet Content Never Sees The Light of Day', TVA_Const::T ),
					'post_type'    => TVA_Const::LESSON_POST_TYPE,
					'post_excerpt' => __( 'Over two million blog articles are written every day. And most of them will never be read. Discover why this happens and how to avoid being part of this junkyard of internet rubbish.', TVA_Const::T ),
					'post_status'  => 'publish',
				),
				'lesson_type'  => 'text',
				'lesson_order' => 1,
				'status'       => 0,
			),

			array(
				'args'         => array(
					'post_title'   => __( 'Mastering Your Technique and Presentation', TVA_Const::T ),
					'post_type'    => TVA_Const::LESSON_POST_TYPE,
					'post_excerpt' => __( 'Check these 4 things before publishing any content online. If you get one of these wrong, the actual content of your blog will not even matter all that much…', TVA_Const::T ),
					'post_status'  => 'publish',
				),
				'lesson_type'  => 'text',
				'lesson_order' => 2,
			),
		),
	),
	array(
		'name'        => 'Thrive Themes - 22 Tips to Build Your Mailing List Faster',
		'args'        => array(
			'description' => __( 'The Cheat Sheet for Turning Your Website Into a More Effective List Building Machine', TVA_Const::T ),
		),
		'cover_image' => TVA_Const::plugin_url( 'img/default_cover.png' ),
		'level'       => 0,
		'logged_in'   => 0,
		'roles'       => array(),
		'topic'       => 0,
		'order'       => 2,
		'status'      => 'private',

		'lessons' => array(
			array(
				'args'         => array(
					'post_title'   => __( 'Introduction – From Internet Rubbish to Content Marketing Gold', TVA_Const::T ),
					'post_type'    => TVA_Const::LESSON_POST_TYPE,
					'post_excerpt' => __( 'Why is it so hard to create engaging content? And what is engaging content actually? Discover what you’ll need to learn in order to make your content marketing efficient', TVA_Const::T ),
					'post_status'  => 'publish',
				),
				'lesson_type'  => 'video',
				'lesson_order' => 0,
				'status'       => 1,
			),
		),
	),
	array(
		'name'        => 'Thrive Themes - Build a Conversion Focused Website From Scratch',
		'args'        => array(
			'description' => __( 'This course will take you from zero to conversion optimized website in 10 steps.', TVA_Const::T ),
		),
		'cover_image' => TVA_Const::plugin_url( 'img/default_cover.png' ),
		'level'       => 0,
		'logged_in'   => 0,
		'roles'       => array(),
		'topic'       => 0,
		'order'       => 1,
		'status'      => 'private',

		'lessons' => array(
			array(
				'args'         => array(
					'post_title'   => __( 'Introduction – From Internet Rubbish to Content Marketing Gold', TVA_Const::T ),
					'post_type'    => TVA_Const::LESSON_POST_TYPE,
					'post_excerpt' => __( 'Why is it so hard to create engaging content? And what is engaging content actually? Discover what you’ll need to learn in order to make your content marketing efficient', TVA_Const::T ),
					'post_status'  => 'publish',
				),
				'lesson_type'  => 'video',
				'lesson_order' => 0,
			),
			array(
				'args'         => array(
					'post_title'   => __( 'Introduction – From Internet Rubbish to Content Marketing Gold', TVA_Const::T ),
					'post_type'    => TVA_Const::LESSON_POST_TYPE,
					'post_excerpt' => __( 'Why is it so hard to create engaging content? And what is engaging content actually? Discover what you’ll need to learn in order to make your content marketing efficient', TVA_Const::T ),
					'post_status'  => 'publish',
				),
				'lesson_type'  => 'video',
				'lesson_order' => 1,
			),
		),
	),
	array(
		'name'        => 'Thrive Themes - Multi Step Mastery: Build a Targeted Mailing List',
		'args'        => array(
			'description' => __( 'Discover the 4 most powerful methods to put this new list building strategy to use.', TVA_Const::T ),
		),
		'cover_image' => TVA_Const::plugin_url( 'img/default_cover.png' ),
		'level'       => 0,
		'logged_in'   => 0,
		'roles'       => array(),
		'topic'       => 0,
		'order'       => 0,
		'status'      => 'private',

		'lessons' => array(
			array(
				'args'         => array(
					'post_title'   => __( 'Introduction – From Internet Rubbish to Content Marketing Gold', TVA_Const::T ),
					'post_type'    => TVA_Const::LESSON_POST_TYPE,
					'post_excerpt' => __( 'Why is it so hard to create engaging content? And what is engaging content actually? Discover what you’ll need to learn in order to make your content marketing efficient', TVA_Const::T ),
					'post_status'  => 'publish',
				),
				'lesson_type'  => 'video',
				'lesson_order' => 0,
			),
			array(
				'args'         => array(
					'post_title'   => __( 'Introduction – From Internet Rubbish to Content Marketing Gold', TVA_Const::T ),
					'post_type'    => TVA_Const::LESSON_POST_TYPE,
					'post_excerpt' => __( 'Why is it so hard to create engaging content? And what is engaging content actually? Discover what you’ll need to learn in order to make your content marketing efficient', TVA_Const::T ),
					'post_status'  => 'publish',
				),
				'lesson_type'  => 'text',
				'lesson_order' => 1,
			),
		),
	),
);
