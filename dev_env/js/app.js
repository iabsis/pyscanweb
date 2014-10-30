var PyscanWeb = (function(jQuery) {
    var $ = jQuery;
    var scannersConfiguration = {};

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    var params = {
        'scanListUrl' : null,
        'launchScannerUrl' : null,
        'pdfGeneratorUrl' : null,
        'scannerListElement' : '#scanner-selector',
        'scannerModeElement' : '#scanner-mode-selector',
        'scannerResolutionElement' : '#scanner-resolution-selector',
        'scannerSourceElement' : '#scanner-source-selector',
        'scannerMultiPageElement' : '#scanner-multipage',
        'launchScannerButton' : '#launch-scanner-button',
        'scannerForm' : '#scanner-form'
    };

    var startLoader = function() {
        $("#loader").stop().fadeIn();
    }

    var stopLoader = function() {
        $("#loader").stop().fadeOut('slow');
    }

    var createScannersInterface = function() {
        var $scannerSelector = $(params.scannerListElement);

        $scannerSelector.find("option").remove();
        $scannerSelector.append("<option></option>");

        for(var scanner in scannersConfiguration) {
            $scannerSelector.append("<option value=\"" + scanner + "\">" + scanner + "</option>");
        }

        $scannerSelector.on("change", function(e) {
            selectedScanner = e.val;

            if (selectedScanner) {
                $(params.launchScannerButton).removeAttr('disabled');
            } else {
                $(params.launchScannerButton).attr('disabled', 'disabled');
            }

            // Update the available modes
            if (scannersConfiguration[e.val] && scannersConfiguration[e.val].mode !== undefined) {
                var availableModes = scannersConfiguration[e.val].mode;
                var $scannerModeSelector = $(params.scannerModeElement);
                $scannerModeSelector.find("option").remove();
                $scannerModeSelector.append("<option></option>");

                for(var i = 0; i < availableModes.length; i++) {
                    $scannerModeSelector.append("<option value=\"" + availableModes[i] + "\">" + availableModes[i] + "</option>");
                }
            } 

            // Update the available spirces
            if (scannersConfiguration[e.val] && scannersConfiguration[e.val].source !== undefined) {
                var availableSources = scannersConfiguration[e.val].source;
                var $scannerSoueceSelector = $(params.scannerSourceElement);
                $scannerSoueceSelector.find("option").remove();
                $scannerSoueceSelector.append("<option></option>");

                for(var i = 0; i < availableSources.length; i++) {
                    $scannerSoueceSelector.append("<option value=\"" + availableSources[i] + "\">" + availableSources[i] + "</option>");
                }
            } 

            // Update the available resolutions
            if (scannersConfiguration[e.val] && scannersConfiguration[e.val].resolution !== undefined) {
                var resolutionParameters = scannersConfiguration[e.val].resolution;
                var $scannerResolutionSelector = $(params.scannerResolutionElement);
                $scannerResolutionSelector.find("option").remove();
                $scannerResolutionSelector.append("<option></option>");

                var min = resolutionParameters.min;
                var max = resolutionParameters.max;
                var step = resolutionParameters.step;

                // Prevent infinite loop in case of wrong data retrieving
                if (max < min) {
                    var tmp = min;
                    min = max;
                    max = tmp;
                };
                for(var current = min; current < max; current += step) {
                    $scannerResolutionSelector.append("<option value=\"" + current + "\">" + current + " dpi</option>");
                }
            } 
        });


    }

    var errorMessage = function(msg) {
        noty({
            timeout: 3000, 
            type: 'error',
            layout: 'topCenter', 
            animation: { 
                open: {opacity: 'toggle'}, 
                close: {opacity: 'toggle'} 
            }, 
            text: msg
        });
    }

    var infoMessage = function(msg, time) {
        if (time === undefined) {
            time = 3000
        };
        noty({
            timeout: time, 
            type: 'info',
            layout: 'topCenter', 
            animation: { 
                open: {opacity: 'toggle'}, 
                close: {opacity: 'toggle'} 
            }, 
            text: msg
        });
    }

    var getScannersList = function() {
        if (params.scanListUrl) {
            startLoader();
            $.getJSON( params.scanListUrl, function(data) {
                scannersConfiguration = data;
                createScannersInterface();
            })
            .fail(function() {
                errorMessage("Unable to retrieve the scanners list");
            }).complete(function() {
                stopLoader();
            });
        };
    };
    /**
     * Initialize ui components
     * @return null
     */
    var initScannerUi = function() {
        $(params.scannerListElement).select2({
            "placeholder" : "Select your scanner"
        });

        $(params.scannerModeElement).select2({
            "placeholder" : "Select the color mode"
        });
        $(params.scannerResolutionElement).select2({
            "placeholder" : "Select the resolution"
        });

        $(params.scannerSourceElement).select2({
            "placeholder" : "Select the source"
        });

        // Manage the form validation
        $(params.scannerForm).submit(function(event) {

            event.preventDefault();
            startLoader();

            var submitData = {
                scanner: $(params.scannerListElement).select2().val(),
                mode: $(params.scannerModeElement).select2().val(),
                resolution: $(params.scannerResolutionElement).select2().val(),
                source: $(params.scannerSourceElement).select2().val(),
                multipage: $(params.scannerMultiPageElement).is(":checked") ? 1 : 0
            };

            $.ajax({
                type: "post",
                url: params.launchScannerUrl,
                data: submitData,
                dataType: 'json'
            }).success(function(jsonData) {
                if (jsonData.error) {
                    errorMessage(jsonData.error);
                    return;
                }

                if (jsonData.links) {
                    $("#pyscan-web-preview img, #pyscan-web-preview-placeholder").fadeOut(function() {
                        $(this).remove();
                    });

                    if (jsonData.links.length > 1) {
                        infoMessage("It appears that you received multiple files. You can click the different images to uncheck the unwanted ones and click \"get PDF\" to get a pdf file.", 10)
                    }
                    for(var i = 0; i < jsonData.links.length; i++) {
                        var $img = $('<img data-id="' + jsonData.links[i].id + '" class="preview-image" src="' + jsonData.links[i].url + '?timestamp=' + (new Date().getTime()) + '" />');
                        $img.hide();
                        $img.addClass("active");
                        $("#pyscan-web-preview").append(
                            $img
                        );

                        $img.on("click", function() {
                            $(this).toggleClass("active");
                        });

                        $img.fadeIn();
                    }
                };
            }).error(function(a, b, c) {
                errorMessage('Unable to get image from scanner. Please try to refresh the page and try again');
            }).complete(function() {
                stopLoader();
            });
        });

        // Manage the pdf generation
        $("#generate-pdf-button").on('click', function(e) {
            var $form = $("<form action='" + params.pdfGeneratorUrl + "' method='post'>");
            $form.append('<input type="text" name="csrfmiddlewaretoken" value="' + getCookie('csrftoken') + '" />');
            $("#pyscan-web-preview img.active").each(function() {
                var id = $(this).data("id");
                $form.append('<input type="text" name="images_list" value="' + id + '" />')
            });

            $form.hide();
            $("body").append($form);
            $form.submit();
            $form.remove();
        });
        
        getScannersList();
    }

    /**
     * below are the publics elements to expose
     */
    return {
        initScannerUi: function(init_params) {
            if (init_params === undefined) {
                init_params = {};
            }
            params = $.extend(params, init_params);
            initScannerUi();
        },
        getCookie : function(name) {
            return getCookie(name);
        }
    }
})(jQuery);


/**
 * Hack to add the django csrf token to each ajax request
 * @param  {[type]} event    [description]
 * @param  {[type]} xhr      [description]
 * @param  {[type]} settings [description]
 * @return {[type]}          [description]
 */
$(document).ajaxSend(function(event, xhr, settings) {
    
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", PyscanWeb.getCookie('csrftoken'));
    }
});
