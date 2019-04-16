// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;// noinspection JSUnusedLocalSymbols
(function ($, window, document, undefined) {

	"use strict";

	// undefined is used here as the undefined global variable in ECMAScript 3 is
	// mutable (ie. it can be changed by someone else). undefined isn't really being
	// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
	// can no longer be modified.

	// window and document are passed through as local variables rather than global
	// as this (slightly) quickens the resolution process and can be more efficiently
	// minified (especially when both are regularly referenced in your plugin).

	// Create the defaults once
	var pluginName = "forminatorFrontSubmit",
		defaults = {
			form_type: 'custom-form',
			forminatorFront: false,
			forminator_selector: '',
			chart_design: 'bar',
			chart_options: {}
		};

	// The actual plugin constructor
	function ForminatorFrontSubmit(element, options) {
		this.element = element;
		this.$el = $(this.element);
		this.forminatorFront = null;


		// jQuery has an extend method which merges the contents of two or
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	// Avoid Plugin.prototype conflicts
	$.extend(ForminatorFrontSubmit.prototype, {
		init: function () {
			this.forminatorFront = this.$el.data('forminatorFront');
			switch (this.settings.form_type) {
				case 'custom-form':
					if (!this.settings.forminator_selector || !$(this.settings.forminator_selector).length) {
						this.settings.forminator_selector = '.forminator-custom-form';
					}
					this.handle_submit_custom_form();
					break;
				case 'quiz':
					if (!this.settings.forminator_selector || !$(this.settings.forminator_selector).length) {
						this.settings.forminator_selector = '.forminator-quiz';
					}
					this.handle_submit_quiz();
					break;
				case 'poll':
					if (!this.settings.forminator_selector || !$(this.settings.forminator_selector).length) {
						this.settings.forminator_selector = '.forminator-poll';
					}
					this.handle_submit_poll();
					break;

			}
		},
		updateContact: function (data, formInput) {

			var updatedInfo = {"contact": {"mobile_number":"5-626-852-0503", "company": {"name":"Widgetz.io (sample)"}}};

			//get the contact id
			var contactID = data.contacts.contacts[0].id;

			$.ajax({
				type: 'PUT',
				headers: { Authorization : 'Token token=ruf8KPf1yojVDU8wBczyzg'},
				url: 'https://geophysicalinsights.freshsales.io/api/contacts/'+contactID,
				cache: false,
				data : updatedInfo,
				success : function(data){
					console.log("we have updated the contact successfully" + data);
				},
				error : function(data){
					console.log("we could not update the data" + data);
				}

			})
		},
		updateLead: function(data, formInput){
			var updatedInfo = {"lead": {"mobile_number":"5-626-852-0503"}};

			//get the contact id
			var leadID = data.leads.leads[0].id;

			$.ajax({
				type: 'PUT',
				headers: { Authorization : 'Token token=ruf8KPf1yojVDU8wBczyzg'},
				url: 'https://geophysicalinsights.freshsales.io/api/leads/' + leadID,
				cache: false,
				data : updatedInfo,
				success : function(data){
					console.log("we have updated the contact successfully" + data);
				},
				error : function(data){
					console.log("we could not update the data" + data);
				}

			})

		},
		createLead: function(formInput){
			var leadInfo = {"lead":{"first_name":"Eric", "last_name":"Sampleton (sample)", "mobile_number":"1-926-652-9503", "company": {"name":"Widgetz.io (sample)"} }};

			// var leadInfo2 = {"lead":{"first_name":"Eric", "last_name":"Sampleton (sample)", "mobile_number":"1-926-652-9503", formInput.company }};

			$.ajax({
				type: 'POST',
				headers: { Authorization : 'Token token=ruf8KPf1yojVDU8wBczyzg'},
				url: 'https://geophysicalinsights.freshsales.io/api/leads/',
				cache: false,
				data : leadInfo,
				success : function(data){
					console.log("we have updated the lead successfully" + data);
				},
				error : function(data){
					console.log("we could not update the lead" + data);
				}

			})

		},
		searchLead: function(data, formInput){
			$.ajax({
				type: 'GET',
				headers: { Authorization : 'Token token=ruf8KPf1yojVDU8wBczyzg'},
				url: 'https://geophysicalinsights.freshsales.io/api/lookup?q='+formInput.email+'&=email&entities=lead',
				cache: false,
				success : this.updateLead(data, formInput),
				error : this.createLead(formInput)
			})
		},
		handle_submit_custom_form: function () {
			var self = this,
				form = $(this.element);

			var success_available = self.$el.find('.forminator-cform-response-message').find('.forminator-label--success').not(':hidden');
			if (success_available.length) {
				self.focus_to_element(self.$el.find('.forminator-cform-response-message'), true);
			}

			$('body').on('submit.frontSubmit', this.settings.forminator_selector, function (e) {
				var $this = $(this),
					formData = new FormData(this),
					$target_message = $this.find('.forminator-cform-response-message'),
					$captcha_field = $this.find('.forminator-g-recaptcha');
				if ($captcha_field.length) {
					//validate only first
					$captcha_field = $($captcha_field.get(0));

					// get the recatpcha widget
					var recaptcha_widget = $captcha_field.data('forminator-recapchta-widget'),
						recaptcha_size = $captcha_field.data('size'),
						$captcha_response = window.grecaptcha.getResponse(recaptcha_widget);

					if (recaptcha_size === 'invisible') {
						if ($captcha_response.length === 0) {
							window.grecaptcha.execute(recaptcha_widget);
							return false;
						}
					}
					// reset after getResponse
					if (self.$el.hasClass('forminator_ajax')) {
						window.grecaptcha.reset(recaptcha_widget);
					}

					$target_message.html('');
					if ($captcha_field.hasClass("error")) {
						$captcha_field.removeClass("error");
					}
					if ($captcha_response.length === 0) {
						if (!$captcha_field.hasClass("error")) {
							$captcha_field.addClass("error");
						}
						$target_message.html('<label class="forminator-label--error"><span>' + window.ForminatorFront.cform.captcha_error + '</span></label>');
						self.focus_to_element($target_message);

						return false;
					}
				}
				if (self.$el.hasClass('forminator_ajax')) {
					$target_message.html('');
					$target_message.html('<label class="forminator-label--info"><span>' + window.ForminatorFront.cform.processing + '</span></label>');
					self.focus_to_element($target_message);

					// Safari FIX, if empty file input, ajax broken
					// Check if input empty
					self.$el.find("input[type=file]").each(function () {
						// IE does not support FormData.delete()
						if ($(this).val() === "") {
							if (typeof(window.FormData.prototype.delete) === 'function') {
								formData.delete($(this).attr('name'));
							}
						}
					});

					e.preventDefault();
					$.ajax({
						type: 'POST',
						url: window.ForminatorFront.ajaxUrl,
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						beforeSend: function () {
							$this.find('button').attr('disabled', true);
						},
						success: function (data) {
							// Hide validation errors
							$this.find('.forminator-label--validation').remove();
							$this.find('.forminator-field').removeClass('forminator-has_error');

							$this.find('button').removeAttr('disabled');
							$target_message.html('');

							var $label_class = data.success ? 'success' : 'error';
							if (typeof data.message !== "undefined") {
								$target_message.html('<div class="forminator-label--' + $label_class + '"><span>' + data.message + '</span></div>');
								self.focus_to_element($target_message, $label_class === 'success');

							} else {
								if (typeof data.data !== "undefined") {
									$label_class = data.data.success ? 'success' : 'error';
									$target_message.html('<div class="forminator-label--' + $label_class + '"><span>' + data.data.message + '</span></div>');
									self.focus_to_element($target_message, $label_class === 'success');
								}
							}

							if (!data.data.success && data.data.errors.length) {
								$this.trigger('forminator:form:submit:failed', formData);
								self.show_messages(data.data.errors);
							}

							if (data.success === true) {
								/*
										/// insert cstom code there
								*/
								//get the user input
								var myResult = {};
                var userEmail = '';
                var company = {};

                for (let value of formData) {
                    if(value[0] === "first-name"){
                        myResult['First Name'] = value[1];
                    }if(value[0] === "last-name"){
                        myResult['Last name'] = value[1];
                    }if(value[0] === "email"){
                        myResult['Email'] = value[1];
                    }if(value[0] === "company"){
                        myResult['company'] = {};
                        myResult['company']['Name'] = value[1];
                        // company['Name'] = value[1];
                    }
                    console.log(value);
                }

								//search for contact
								//if contact
									//update contact
								//if not search for lead
								//if lead
									//update lead
								//if not create lead

								$.ajax({
									type: 'GET',
									headers: { Authorization : 'Token token=ruf8KPf1yojVDU8wBczyzg'},
									url: 'https://geophysicalinsights.freshsales.io/api/lookup?q='+myResult.Email+'&=email&entities=contact',
									cache: false,
									success : this.updateContact(data, myResult),
									error : this.searchLead(data, myResult)
								})

								// Reset form
								if ($this[0]) {
									$this[0].reset();

									// Reset upload field
									$this.find(".forminator-upload--remove").hide();
									$this.find('.forminator-upload .forminator-input').val("");
									$this.find('.forminator-upload .forminator-label').html( window.ForminatorFront.cform.no_file_chosen );

									// Reset selects
									$this.find('.forminator-select').each(function () {
										$(this).val(null).trigger("change");
									});

									$this.trigger('forminator:form:submit:success', formData);

									// restart condition after form reset to ensure values of input already reset-ed too
									$this.trigger('forminator.front.condition.restart');
								}

								if (typeof data.data.url !== "undefined") {
									window.location.href = data.data.url;
								}

								if (typeof data.data.behav !== "undefined" && data.data.behav === 'behaviour-hide') {
									self.$el.hide();
								}
							}
						},
						error: function (err) {
							$this.find('button').removeAttr('disabled');
							$target_message.html('');
							var $message = err.status === 400 ? window.ForminatorFront.cform.upload_error : window.ForminatorFront.cform.error;
							$target_message.html('<label class="forminator-label--notice"><span>' + $message + '</span></label>');
							self.focus_to_element($target_message);

							$this.trigger('forminator:form:submit:failed', formData);
						}
					});
					return false;
				}
				return true;
			});
		},
		handle_submit_quiz: function () {
			var self = this;

			$('body').on('submit.frontSubmit', this.settings.forminator_selector, function (e) {
				var form = $(this),
					ajaxData = []
				;
				e.preventDefault();

				// Enable all inputs
				self.$el.find('.forminator-has-been-disabled').removeAttr('disabled');

				// Serialize fields, that should be placed here!
				ajaxData = form.serialize();

				// Disable inputs again
				self.$el.find('.forminator-has-been-disabled').attr('disabled', 'disabled');

				var $button = self.$el.find('.forminator-button'),
					loadingLabel = $button.data( 'loading' );

				if (loadingLabel !== '') {
					$button.text(loadingLabel);
				}

				$.ajax({
					type: 'POST',
					url: window.ForminatorFront.ajaxUrl,
					data: ajaxData,
					beforeSend: function () {
						self.$el.find('button').attr('disabled', 'disabled')
					},
					success: function (data) {
						if (data.success) {
							if (data.data.type === 'nowrong') {
								window.history.pushState('forminator', 'Forminator', data.data.result_url);
								self.$el.find('.forminator-quiz--result').html(data.data.result);
								self.$el.find('.forminator-answer input').attr('disabled', 'disabled');
							} else if (data.data.type === 'knowledge') {
								window.history.pushState('forminator', 'Forminator', data.data.result_url);
								if (self.$el.find('.forminator-quiz--result').size() > 0) {
									self.$el.find('.forminator-quiz--result').html(data.data.finalText);
								}
								Object.keys(data.data.result).forEach(function (key) {
									var parent = self.$el.find('#' + key);
									parent.find('.forminator-question--result').html( '<span>' + data.data.result[key].message + '</span>' );
									parent.find('.forminator-submit-rightaway').attr('disabled', 'disabled');

									var answerClass,
										$answer = self.$el.find('[id|="' + data.data.result[key].answer + '"]'),
										$container = $answer.closest('.forminator-answer')
									;

									if (data.data.result[key].isCorrect) {
										answerClass = 'forminator-is_correct';
									} else {
										answerClass = 'forminator-is_incorrect';
									}
									$container.addClass(answerClass);
								});
							}
						} else {
							self.$el.find('button').removeAttr('disabled');
						}
					}
				});
				return false;
			});

			$('body').on('click', '.forminator-result--retake', function () {
				location.reload();
			});
		},

		handle_submit_poll: function () {
			var self = this;

			// fadeout forminator-poll-response-message success
			var success_available = self.$el.find('.forminator-poll-response-message').find('.forminator-label--success').not(':hidden');
			if (success_available.length) {
				self.focus_to_element(self.$el.find('.forminator-poll-response-message'), true);
			}

			$('body').on('submit.frontSubmit', this.settings.forminator_selector, function (e) {
				var $this = $(this);
				var $target_message = self.$el.find('.forminator-poll-response-message');
				if (self.$el.hasClass('forminator_ajax')) {
					$target_message.html('');
					$target_message.html('<label class="forminator-label--info"><span>' + window.ForminatorFront.poll.processing + '</span></label>');
					self.focus_to_element($target_message);

					e.preventDefault();
					$.ajax({
						type: 'POST',
						url: window.ForminatorFront.ajaxUrl,
						data: self.$el.serialize(),
						beforeSend: function () {
							self.$el.find('button').attr('disabled', true);
						},
						success: function (data) {
							self.$el.find('button').removeAttr('disabled');
							$target_message.html('');
							var $label_class = data.success ? 'success' : 'error';
							if (data.success === false) {
								$target_message.html('<label class="forminator-label--' + $label_class + '"><span>' + data.data.message + '</span></label>');
								self.focus_to_element($target_message);
							} else {
								if (typeof data.data !== "undefined") {
									$label_class = data.data.success ? 'success' : 'error';
									$target_message.html('<label class="forminator-label--' + $label_class + '"><span>' + data.data.message + '</span></label>');
									self.focus_to_element($target_message, $label_class === 'success');

								}
							}

							if (data.success === true) {
								if (typeof data.data.url !== "undefined") {
									window.location.href = data.data.url;
								} else {
									// url not exist, it will render chart on the fly if chart_data exist on response
									// check length is > 1, because [0] is header
									if (typeof data.data.chart_data !== "undefined" && data.data.chart_data.length > 1) {
										// only render when google loader defined
										if (typeof google !== 'undefined') {
											if (typeof google.visualization === 'undefined') {
												// try to load google chart
												google.charts.load('current', {packages: ['corechart', 'bar']});
												google.charts.setOnLoadCallback(function () {
													self.render_poll_chart(data.data.chart_data, data.data.back_button, self);
												});
											} else {
												// google chart already loaded render
												self.render_poll_chart(data.data.chart_data, data.data.back_button, self);
											}
										}
									}
								}
							}
						},
						error: function () {
							self.$el.find('button').removeAttr('disabled');
							$target_message.html('');
							$target_message.html('<label class="forminator-label--notice"><span>' + window.ForminatorFront.poll.error + '</span></label>');
							self.focus_to_element($target_message);

						}
					});
					return false;
				}
				return true;
			});
		},

		render_poll_chart: function (chart_data, back_button, forminatorSubmit) {
			// remove previously chart if avail
			forminatorSubmit.$el.find('.forminator-poll--chart').remove();
			var form_id = forminatorSubmit.$el.attr('id') + '-' + forminatorSubmit.$el.data('forminatorRender'),
				poll_element_id = 'forminator-chart-poll-' + form_id,
				poll_container = $('<div id="' + poll_element_id + '" class="forminator-poll--chart" style="width: 100%; height: 300px;"></div>'),
				data = google.visualization.arrayToDataTable(chart_data),
				back_element = $(back_button),
				chart = false;

			// create poll container
			$(poll_container).insertBefore(forminatorSubmit.$el.find('.forminator-poll--answers'));
			// hide answers radio
			forminatorSubmit.$el.find('.forminator-poll--answers').hide();
			// remove buttons
			forminatorSubmit.$el.find('.forminator-poll--actions').empty();
			//append back button

			back_element.click(function (e) {
				e.preventDefault();
				// TODO : re-render poll, with updated state (user_can_vote etc)
				location.reload();
			});
			forminatorSubmit.$el.find('.forminator-poll--actions').append(back_element);

			if (forminatorSubmit.settings.chart_design === 'bar') {
				chart = new google.visualization.BarChart(document.getElementById(poll_element_id));
			} else if (this.settings.chart_design === 'pie') {
				chart = new google.visualization.PieChart(document.getElementById(poll_element_id));
			}
			if (chart) {
				chart.draw(data, forminatorSubmit.settings.chart_options);
			}


		},

		focus_to_element: function ($element, fadeout) {
			fadeout = fadeout || false;

			// force show in case its hidden of fadeOut
			$element.show();
			$('html,body').animate({scrollTop: ($element.offset().top - ($(window).height() - $element.outerHeight(true)) / 2)}, 500, function () {
				if (!$element.attr("tabindex")) {
					$element.attr("tabindex", -1);
				}
				$element.focus();
				if (fadeout) {
					// fadeout after 5 second delay
					$element.show().delay(5000).fadeOut('slow');
				}

			});
		},

		show_messages: function (errors) {
			var self = this;

			var forminatorFrontCondition = self.$el.data('forminatorFrontCondition');
			if (typeof forminatorFrontCondition !== 'undefined') {
				// clear all validation message before show new one
				this.$el.find('.forminator-label--validation').remove();
				var i = 0;
				errors.forEach(function (value) {
					var element_id = Object.keys(value),
						message = Object.values(value);

					var element = forminatorFrontCondition.get_form_field(element_id);
					if (element.length) {
						if (i === 0) {
							// focus on first error
							self.$el.trigger('forminator.front.pagination.focus.input',[element]);
							self.focus_to_element(element);
						}

						if ($(element).hasClass('forminator-input-time')) {
							var $time_field_holder = $(element).closest('.forminator-field:not(.forminator-field--inner)'),
								$time_error_holder = $time_field_holder.children('.forminator-label--validation');

							if ($time_error_holder.length === 0) {
								$time_field_holder.append('<label class="forminator-label--validation"></label>');
								$time_error_holder = $time_field_holder.children('.forminator-label--validation');
							}
							$time_error_holder.html(message);
						}

						var $field_holder = $(element).closest('.forminator-field--inner');

						if ($field_holder.length === 0) {
							$field_holder = $(element).closest('.forminator-field');
							if ($field_holder.length === 0) {
								// handling postdata field
								$field_holder = $(element).find('.forminator-field');
								if ($field_holder.length > 1) {
									$field_holder = $field_holder.first();
								}
							}
						}

						var $error_holder = $field_holder.find('.forminator-label--validation');

						if ($error_holder.length === 0) {
							$field_holder.append('<label class="forminator-label--validation"></label>');
							$error_holder = $field_holder.find('.forminator-label--validation');
						}
						$(element).attr('aria-invalid', 'true');
						$error_holder.html(message);
						$field_holder.addClass('forminator-has_error');
						i++;
					}
				});
			}

			return this;
		}

	});

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, pluginName)) {
				$.data(this, pluginName, new ForminatorFrontSubmit(this, options));
			}
		});
	};

})(jQuery, window, document);
