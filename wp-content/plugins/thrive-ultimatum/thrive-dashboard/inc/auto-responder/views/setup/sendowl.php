<h2 class="tvd-card-title">
	<?php echo $this->getTitle() ?>
</h2>
<div class="tvd-row">
	<form class="tvd-col tvd-s12">
		<input type="hidden" name="api" value="<?php echo $this->getKey() ?>"/>

		<div class="tvd-input-field">
			<input id="tvd-mm-api-key" type="text" name="connection[key]"
			       value="<?php echo $this->param( 'key' ) ?>">
			<label for="tvd-mm-api-key"><?php echo __( 'API key', TVE_DASH_TRANSLATE_DOMAIN ) ?></label>
		</div>
		<div class="tvd-input-field">
			<input id="tvd-mm-api-key" type="text" name="connection[secret]"
			       value="<?php echo $this->param( 'secret' ) ?>">
			<label for="tvd-mm-api-key"><?php echo __( 'API Secret', TVE_DASH_TRANSLATE_DOMAIN ) ?></label>
		</div>
		<br/>
		<a href="https://thrivethemes.com/tkb_item/how-to-set-the-right-permissions-for-a-new-api-key-in-sendowl/" target="_blank"><?php echo __( 'Important: Be sure to set the right permissions for your API key to work', TVE_DASH_TRANSLATE_DOMAIN )?></a>
		<?php $this->display_video_link(); ?>
	</form>
</div>
<div class="tvd-card-action">
	<div class="tvd-row tvd-no-margin">
		<div class="tvd-col tvd-s12 tvd-m6">
			<a class="tvd-api-cancel tvd-btn-flat tvd-btn-flat-secondary tvd-btn-flat-dark tvd-full-btn tvd-waves-effect"><?php echo __( 'Cancel', TVE_DASH_TRANSLATE_DOMAIN ) ?></a>
		</div>
		<div class="tvd-col tvd-s12 tvd-m6">
			<a class="tvd-api-connect tvd-waves-effect tvd-waves-light tvd-btn tvd-btn-green tvd-full-btn"><?php echo __( 'Connect', TVE_DASH_TRANSLATE_DOMAIN ) ?></a>
		</div>
	</div>
</div>

