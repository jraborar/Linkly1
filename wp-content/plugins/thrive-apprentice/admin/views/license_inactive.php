<?php
/**
 * notice to be displayed if license is not validated / active
 * going to load the styles inline because there are so few lines and not worth an extra server hit.
 */
?>
<div class="tve-apprentice-notice-overlay">
	<div id="tve_apprentice_license_notice">
        <img src="<?php echo TVA_Const::plugin_url( 'img/tva-apprentice-logo.png' ) ?>">

		<p>
			<?php echo __( 'You need to', TVA_Const::T ) ?>
			<a class="tve-license-link"
			   href="<?php echo admin_url( 'admin.php?page=tve_dash_license_manager_section' ); ?>"><?php echo __( 'activate your license', TVA_Const::T ) ?></a>
			<?php echo __( 'before you can use the Thrive Apprentice 2.0 plugin!', TVA_Const::T ) ?>
		</p>
	</div>
</div>
<style type="text/css">
	.tve-apprentice-notice-overlay {
		z-index: 1000000;
		background: rgba(0, 0, 0, .4);
		position: fixed;
		width: 100%;
		max-width: 100%;
		margin-right: -160px;
		height: 100%;
		top: 32px;
		right: 0;
	}

	@media (max-width: 960px) {
		.tve-apprentice-notice-overlay {
			margin-right: -36px;
		}

		#tve_apprentice_license_notice {
			margin-left: -276px !important;
		}
	}

	@media (max-width: 783px) {
		.tve-ultimatum-notice-overlay {
			margin-right: 0px;
		}

		#tve_apprentice_license_notice {
			margin-left: -300px !important;
		}
	}

	#tve_apprentice_license_notice {
		width: 500px;
		text-align: center;
		top: 50%;
		left: 50%;
		margin: -100px 0 0 -250px;
		padding: 50px;
		z-index: 3000;
		position: fixed;
		-moz-border-radius-bottomleft: 10px;
		-webkit-border-bottom-left-radius: 10px;
		border-bottom-left-radius: 10px;
		-moz-border-radius-bottomright: 10px;
		-webkit-border-bottom-right-radius: 10px;
		border-bottom-right-radius: 10px;
		border-bottom: 1px solid #bdbdbd;
		background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgi…3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPjwvc3ZnPiA=');
		background-size: 100%;
		background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(20%, #ffffff), color-stop(100%, #e6e6e6));
		background-image: -webkit-linear-gradient(top, #ffffff 20%, #e6e6e6 100%);
		background-image: -moz-linear-gradient(top, #ffffff 20%, #e6e6e6 100%);
		background-image: -o-linear-gradient(top, #ffffff 20%, #e6e6e6 100%);
		background-image: linear-gradient(top, #ffffff 20%, #e6e6e6 100%);
		-moz-border-radius: 10px;
		-webkit-border-radius: 10px;
		border-radius: 10px;
		-webkit-box-shadow: 2px 5px 3px #efefef;
		-moz-box-shadow: 2px 5px 3px #efefef;
		box-shadow: 2px 2px 5px 3px rgba(0, 0, 0, .4);
	}

	#tve_apprentice_license_notice .tve-license-link, #tve_apprentice_license_notice .tve-license-link:active, #tve_apprentice_license_notice .tve-license-link:visited {
		color: #5DA61E;
	}
</style>