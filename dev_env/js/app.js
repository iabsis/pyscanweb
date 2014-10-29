var PyscanWeb = (function(jQuery) {
    var $ = jQuery;
    var scannersConfiguration = {};

    var params = {
        'scanListUrl' : null,
        'launchScannerUrl' : null,
        'scannerListElement' : '#scanner-selector',
        'scannerModeElement' : '#scanner-mode-selector',
        'scannerResolutionElement' : '#scanner-resolution-selector',
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
        alert(msg)
    }

    var getScannersList = function() {
        if (params.scanListUrl) {
            startLoader();
            $.getJSON( params.scanListUrl, function(data) {
                scannersConfiguration = data;
                console.log(scannersConfiguration);
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

        // Manage the form validation
        console.log($(params.scannerForm));
        $(params.scannerForm).submit(function(event) {

            event.preventDefault();

            var submitData = {
                scanner: $(params.scannerListElement).select2().val(),
                mode: $(params.scannerModeElement).select2().val(),
                resolution: $(params.scannerResolutionElement).select2().val(),
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

                    for(var i = 0; i < jsonData.links.length; i++) {
                        var $img = $('<img class="preview-image" src="' + jsonData.links[i] + '?timestamp=' + (new Date().getTime()) + '" />');
                        $img.hide();
                        console.log($img);
                        $("#pyscan-web-preview").append(
                            $img
                        );

                        $img.fadeIn();
                    }
                };
            }).error(function(e) {
                errorMessage('Unable to get image from scanner. Please try to refresh the page and try again');
            });
        })
        
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
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});
