$.vessel = function(el, config) {
    var that = el;
    var option = {
        headerMenu: false,
        headerMenuData: [],
        onShowHideMenu: null,
        onResizeSmall: null,
        onResizeMiddle: null,
        onResizeLarge: null
    };
    //融合配置项
    var opts = $.extend(true, {}, option, config);
    that.data("vessel", that);
    that.renderVessel = function(opts) {
        that.children("div").each(function() {
            var options = that.parseOptions(this);
            if ("north,south,east,west,center".indexOf(options.region) >= 0) {
                switch (options.region) {
                    case "north":
                        that.initHeader(options, $(this));
                        break;
                    case "center":
                        that.initCenter(options, $(this));
                        break;
                    default:
                        break;
                }
            }
        })
        var width = $(window).width();
        if (width < 768) {
            that.removeClass("vessel-middle").addClass("vessel-small");
        } else if (width < 992) {
            that.removeClass("vessel-small").addClass("vessel-middle");
        } else {
            that.removeClass("vessel-middle").removeClass("vessel-small")
        }
        that.bindEvents();
    };
    that.parseOptions = function(target) {
        var t = $(target),
            s = $.trim(t.attr('data-options')),
            first = null,
            last  = null,
            options = {};
        
        if (s){
            first = s.substring(0,1);
            last  = s.substring(s.length-1,1);
            if (first != '{') s = '{' + s;
            if (last != '}') s = s + '}';
            options = (new Function('return ' + s))();
        }
        return options;
    };
    that.initHeader = function(options, element) {
        element.children("div").each(function() {
            $(this).addClass("header-content");
            if ($(this).hasClass("vessel-center")) {
                var options = that.parseOptions(this);
                that.initMenu(options.headerMenuData, $(this));
                that.initButton();
                that.bindMenu(options);
                //break;
            }
        })
    };
    that.initMenu = function(headerMenuData, element) {
        var $this = that;
        if (headerMenuData && element.children().length == 0 && headerMenuData.length) {
            element.addClass("menu-container")
            var html = "";
            var data = headerMenuData;
            html = $this._generateHTML(html, data);
            element.addClass('navbar').append(html);
        }
    };
    //根据data生成HTML
    that._generateHTML = function(html, data) {
        var orData = data,
            dataLength = data.length;
        html += "<ul class='navbar-nav'>";
        for (var i = 0; i < dataLength; i++) {
            html += "<li class='vertical-menu'>";
            html += that._generateANode(data[i]);
            html += "</li>";
        }
        html += "</ul>";
        return html;
    };
    //生成a元素
    that._generateANode = function(node, str) {
        if (str) {
            str += "<a class=''";
        } else {
            str = "<a class=''";
        }
        var nameField = "name";
        if (node.iconclass) {
            str += " data-icon='" + node.iconclass + "'";
            str += " class='" + node.iconclass + "' ";
        }
        if (node[nameField]) {
            str += " data-name='" + node[nameField] + "'";
        }
        if (node.disabled) {
            str += " data-disabled='" + node.disabled + "'";
        }
        if (node.url) {
            str += " data-url='" + node.url + "'";
        }
        if (node.target) {
            str += " data-target='" + node.target + "'";
        }
        str += ">" + node[nameField];
        if (node.items) {
            str += '<b class="caret"></b>';
        }
        str += "</a>";
        if (node.items) {
            str += that._initChildMenu(node.items);
        }
        return str;
    };
    that.initButton = function() {
        var button = "";
        button = '<button class="navbar-toggle" type="button">' +
            '<span class="icon-bar"></span>' +
            '<span class="icon-bar"></span>' +
            '<span class="icon-bar"></span>' +
            '</button>';
        $(".header", that).append(button);
    };
    that._initChildMenu = function(items) {
        var html = "<ul class='dropdown-menu horizon-menu'>";
        for (var i = 0; i < items.length; i++) {
            html += "<li>"
            html += that._generateANode(items[i]);
            html += "</li>"
        }
        html += "</ul>";
        return html;
    };
    //绑定事件
    that.bindEvents = function() {
        var _timer = false,
            _resizable = true;
        $(window).resize(function() {
            if (!_resizable) {
                return;
            }
            if (_timer !== false) {
                clearTimeout(_timer);
            }
            _timer = setTimeout(function() {
                _resizable = false;
                var width = $(window).width();
                if (width < 768) {
                    that.removeClass("vessel-middle").addClass("vessel-small");
                    if ($.isFunction(opts.onResizeSmall)) {
                        opts.onResizeSmall.call(that, null, { width: width });
                    }
                } else if (width < 992) {
                    that.removeClass("vessel-small").addClass("vessel-middle");
                    if ($.isFunction(opts.onResizeMiddle)) {
                        opts.onResizeMiddle.call(that, null, { width: width });
                    }
                } else {
                     that.removeClass("vessel-middle").removeClass("vessel-small");
                     $(".vessel-center", that).removeClass("show");
                    if ($.isFunction(opts.onResizeLarge)) {
                        opts.onResizeLarge.call(that, null, { width: width });
                    }
                }
                _timer = false;
                _resizable = true;
            }, 200);

        })
    };
    that.bindMenu = function(options) {
        var targetMenu;

        function showHideMenu(target) {
            var targetLi = $(target.target).parent("li"),
                childUL = targetLi.children("ul");
            targetLi.siblings().children("ul").removeClass("show");
            if (childUL.length && childUL.hasClass("dropdown-menu")) {
                targetMenu = childUL;
                childUL.toggleClass("show");
                if (childUL.hasClass("horizon-menu") && !targetLi.hasClass("vertical-menu")) {
                    parentWidth = childUL.width();
                    childUL.css("left", parentWidth)
                }
                if ($.isFunction(options.onShowHideMenu)) {
                    opts.onShowHideMenu.call(that, childUL, { isShow: childUL.hasClass("show") });
                }
            }
        }
        if (options.hoverShow) {
            $(".header .navbar-nav li").on("mouseenter", function(e) {
                e.stopPropagation();
                $(".header .navbar-nav li").addClass("showmenu")
                showHideMenu(e);
            })
            $(".header .navbar-nav li").on("mouseleave", function(e) {
                e.stopPropagation();
                $(".header .navbar-nav li").addClass("showmenu")
                showHideMenu(e);
            })
        }
        $(".header .navbar-nav li").on("click", function(e) {
            e.stopPropagation();
            $(".header .navbar-nav li").addClass("showmenu");
            showHideMenu(e);
        })
        $(".header .navbar-nav li").on("blur", function(e) {
            $(".header .navbar-nav li").removeClass("showmenu")
            showHideMenu(e);
        })
        $("body").on("click", function() {
            if (targetMenu && targetMenu.hasClass("show")) {
                targetMenu.removeClass("show")
                targetMenu.parents(".show").removeClass("show")
            }
        })
        $(".navbar-toggle").on("click", function() {
            var headerHeight = $(".header", that).outerHeight();
            $(".header .menu-container", that).toggleClass("show").animate({ top: headerHeight });
        })
    };
    that.initCenter = function(options) {

    };
    that.reload = function(url) {
        if (url) {
            if (typeof(url) == "string") {
                $.ajax({
                    url: opts.url,
                    data: opts.postData,
                    success: function(data) {
                        opts.data = data;
                    }
                })
            } else {
                opts.data = url;
            }
        }
        $.each(opts.data, function(index, value) {
            opts.data[index] = parseInt(value);
        });
        that.setData(opts);
        that.checkRange();
        that.updatePageSize(opts, that);
    };

    that.renderVessel(opts);
}
$.fn.vessel = function() {
    var that = this,
        args = Array.prototype.slice.call(arguments);

    if (typeof args[0] === 'string') {
        var $instance = $(that).data('vessel');
        if (!$instance) {
            throw new Error('cannot call methods on pager prior to initialization; attempted to call method' + args[0]);
        } else {
            return $instance.callMethod(args[0], Array.prototype.slice.call(arguments, 1));
        }
    } else {
        return new $.vessel(this, args[0]);
    }
};