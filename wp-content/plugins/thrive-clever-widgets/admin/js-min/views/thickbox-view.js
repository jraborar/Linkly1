/*! Thrive Clever Widgets 2020-02-05
* http://www.thrivethemes.com 
* Copyright (c) 2020 * Thrive Themes */
var tcw_app=tcw_app||{};!function(a){"use strict";tcw_app.ThickboxView=Backbone.View.extend({el:"#TB_window #tcw-options-container",events:{"click .tcw_save_widget_options":"saveOptions","click .tcw_add_new_template":"saveTemplate","click .tcw_load_saved_options":"loadTemplate","click .tcw-close-thickbox":function(){tb_remove()}},initialize:function(){this.$templatesList=a(".tcw_saved_options"),this.render(),this.renderTemplatesList()},render:function(){var a=this;_.each(this.collection.models,function(b){a.renderHangerView(b)})},renderHangerView:function(a){new tcw_app.HangerView({model:a,el:jQuery("#"+a.get("identifier"))}).render()},renderTemplatesList:function(){var b=this;this.$templatesList.find("option").each(function(b){b>0&&a(this).remove()}),_.each(tcw_app.savedTemplates.models,function(a){b.$templatesList.append('<option value="'+a.get("id")+'">'+a.get("name")+"</option>")})},loadTemplate:function(){if("0"===this.$templatesList.val())return this.collection=tcw_app.hangers,void this.render();var a=tcw_app.savedTemplates.findWhere({id:this.$templatesList.val()});this.collection.uncheckAll(),this.collection.each(function(b,c){var d=a.get("hangers").at(c);_.forEach(d.toJSON(),function(a,c){if(a.options.length){var d=b.get("tabs").at(a.index).get("options");_.forEach(a.options,function(a){var b=d.findWhere({id:a});b?b.set("isChecked",!0):d.push({type:"direct_url",id:a,label:a})})}})}),this.render(),this.displayMessage("<strong>"+a.get("name")+"</strong> settings loaded !")},saveOptions:function(b){var c={options:[JSON.stringify(this.collection.at(0)),JSON.stringify(this.collection.at(1))],widget:this.widget},d=a(b.target),e=d.html();d.html("Saving...").attr("disabled",!0),a.post(this.urlSaveOptions,c,function(){d.html(e).attr("disabled",!1),tb_remove()})},saveTemplate:function(b){var c=a("input[name='tcw_new_template_name']"),d=this;if(!c.val().trim().length)return void alert("Please select a name for your template !");var e={name:c.val().trim(),options:[JSON.stringify(this.collection.at(0)),JSON.stringify(this.collection.at(1))]},f=!1;_.each(tcw_app.savedTemplates.models,function(a){a.get("name")===e.name&&(f=!confirm('"'+e.name+'" template already exists. Do you want to overwrite it ?'))}),f||(tcw_app.showLoader(),a.ajax({type:"post",dataType:"json",data:e,url:d.urlSaveTemplate,success:function(b){if(!b.success)return void d.displayMessage(b.message?b.message:"Error while saving the template !",function(){jQuery("#TB_ajaxContent").scrollTop(0)},"error");c.val(""),tcw_app.savedTemplates=new tcw_app.Templates(b.templates),d.renderTemplatesList(),d.$templatesList.find("option").each(function(){a(this).text()===e.name&&a(this).attr("selected","selected")}),d.displayMessage(b.message,function(){jQuery("#TB_ajaxContent").scrollTop(0)})},error:function(a,b,c){d.displayMessage(" ( Error info: <strong>"+c+"</strong> )",function(){d.$el.scrollTop(0)},"error")},complete:function(){tcw_app.hideLoader()}}))},displayMessage:function(a,b,c){void 0===c&&(c="updated");var d=this.$el.find("#tcw-message-container");d.html('<div class="'+c+'"><p>'+a+"</p></div>"),d.slideDown(200,function(){setTimeout(function(){d.slideUp(200,function(){d.html("")})},6e3)}),b&&b.call()}})}(jQuery);