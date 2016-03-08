/* TO-DO:
 *
 * cache selectors 
 *
*/

;
(function ($, window, document, undefined) {

  "use strict";

  var pluginName = "cruddy",
    defaults = {
      slug:           'users',
      validation:     'validateLaravel',
      listtype:       'listLaravel',
      autofocus:      true,

      templates: {
        noresults :  '#no-results',
        create_edit:  '#create-edit',
        pagination:   '#list-pagination',
        row:          '#row-item'
      },

      selectors: {
        create:       '.btn-create',
        del:          'button[data-action="delete"]',
        id:           'input[name="id"]',
        limit:        '[name="limit"]',
        modal:        '#modal-create-edit',
        refresh:      '.btn-refresh',
        pagination:   '.pagination > li > span',
        read:         'button[data-action="read"]',
        search:       '.search',
        search_field: 'input[name="q"]',
        sort:         'th[data-col]',
        table:        '.table-list',
        update:       '.create-edit'
      },

      styles: {
        tbody:              'table tbody',
        thead:              'thead',
        pagination:         'list-pagination',
        hide:               'hide',
        form_group:         'form-group',
        em:                 'em',

        alert: {
          base:             'alert-control',
          alert_success:    'alert-success',
          alert_danger:     'alert-danger'
        },
        refresh: {
          btn_refresh:      'btn-refresh',
          fa_spin:          'fa-spin'
        },
        sort: {
          em:               'em-sort',
          fa:               'fa-sort',
          sort_asc:         'fa-sort-asc',
          sort_desc:        'fa-sort-desc'
        },
        error: {
          has_error:        'has-error',
          help_block:       'help-block',
          strong:           'strong'
        }
      },

      lang: {
        saved:        'Saved',
        deleted:      'Deleted',
        confirm:      'Are you sure?',
        failed:       'Request failed!',
        errors:       {
                        500: 'Unable to process data.',
                        404: 'Resource not found.'
                      }
      },

      list: {
        direction:    'asc',
        limit:        10,
        sort:         'id',
        search:       ''
      },

      create: {
        id:           '',
        name:         '',
        email:        ''
     }
    };

  function Plugin(element, options) {
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  $.extend(Plugin.prototype, {
    /* start plugin */
      init: function () {
        this.localSettings();
        this.localStorage();
        this.$element = $(this.element);
        this.bindEvents().render();
        this.callback('onInit');
      },

      localSettings: function () {
        this.alert_timeout = false;
        this.list_url = $(this.element).find(this.settings.selectors.table).attr('data-href');
        this.default_list_url = $(this.element).find(this.settings.selectors.table).attr('data-href');
        return this;
      },

      localStorage: function () {
        /* TO-DO: clean this up, object like other settings */
        if (this.getLocalStorage('sort')) this.settings.list.sort = this.getLocalStorage('sort');
        if (this.getLocalStorage('direction')) this.settings.list.direction = this.getLocalStorage('direction');
        if (this.getLocalStorage('search')) {
          this.settings.list.search = this.getLocalStorage('search');
          $(this.element).find(this.settings.selectors.search_field).val(this.settings.list.search);
        }
        if (this.getLocalStorage('limit')) {
          this.settings.list.limit = this.getLocalStorage('limit');
          $(this.element).find(this.settings.selectors.limit).val(this.settings.list.limit);
        }
        if (this.getLocalStorage('list_url')) this.list_url = this.getLocalStorage('list_url');
        return this;
      },

    /* bound event functions */
      bindEvents: function () {
        var plugin = this;
        /* refresh */
        this.$element.on('click', plugin.settings.selectors.refresh, function (e) {
          plugin.refresh.call(plugin, $(this));
        });

        /* pagination */
        $(this.element).on('click', plugin.settings.selectors.pagination, function (e) {
          plugin.pagination.call(plugin, $(this));
        });

        /* limit */
        $(this.element).on('change', plugin.settings.selectors.limit, function (e) {
          e.preventDefault();
          plugin.limit.call(plugin, $(this));
        });

        /* search */
        $(this.element).on('submit', plugin.settings.selectors.search, function (e) {
          e.preventDefault();
          plugin.search.call(plugin, $(this));
        });

        /* sort */
        $(this.element).on('click', plugin.settings.selectors.sort, function () {
          plugin.sort.call(plugin, $(this));
        });

        /* create */
        $(this.element).on('click', plugin.settings.selectors.create, function (e) {
          e.preventDefault();
          plugin.create.call(plugin, $(this));
        });

        /* read */
        $(this.element).on('click', plugin.settings.selectors.read, function (e) {
          e.preventDefault();
          plugin.read.call(plugin, $(this));
        });

        /* update */
        $(this.element).on('submit', plugin.settings.selectors.update, function (e) {
          e.preventDefault();
          plugin.update.call(plugin, $(this));
        });

        /* delete */
        $(this.element).on('click', plugin.settings.selectors.del, function (e) {
          e.preventDefault();
          plugin.del.call(plugin, $(this));
        });

        $(this.element).on('shown.bs.modal', '.modal', function () {
          plugin.autofocus(this);
        });
       
        return this.callback('onBindEvents');
      },

      unbindEvents: function () {
        this.$element.off('.' + this._name);
        return this;
      },

    /* bound event functions */

      autofocus: function ($this) {
        if(!this.settings.autofocus) return this;
        setTimeout(function(){
          $('input:text:visible:first', $this).focus();   
        }, 200);
        return this;
      },
      refresh: function ($this) {
        this.render().callback('onRefresh');
        return this;
      },

      pagination: function ($this) {
        this.setUrl($this.attr('data-href')).render().callback('onPagination');
        return this;
      },

      limit: function ($this) {
        this.setUrl().setLimit($this.val()).render().callback('onLimit');
        return this;
      },

      search: function ($this) {
        this.setUrl().setSearch($this.find(this.settings.selectors.search_field).val()).render().callback('onSearch');
        return this;
      },

      sort: function ($this) {
        this.setSort($this.attr('data-col')).sortStyle($this, this.settings.list.direction).setDirection(this.settings.list.direction == 'asc' ? 'desc' : 'asc').render().callback('onSort');
        return this;
      },

      create: function ($this) {
        this.triggerCreate($this).callback('onCreate');
        return this;
      },
     
    /* ajax calls */
      read: function ($this) {
        var plugin = this;
        plugin.ajax({
          url: $this.attr('data-href'),
          success: function (data) {
            plugin.log(data);
            if (data.success == true) {
              plugin.triggerRead(data);
            } else plugin.error(data.errors);
          }
        });
        return this.callback('onRead');
      },

      update: function ($this) {
        var plugin = this,
          _url     = this.updateUrl($this),
          _data    = $('input', $this).filter(function () {
                        var _type = this.type;
                        if(_type == 'text' || _type == 'textarea'){
                          return this.value != this.defaultValue
                        } else if(_type = 'select'){
                          return this.value != this.defaultSelected
                        } else if(_type = 'checkbox' || _type == 'radio')
                          return this.value != this.defaultChecked
                     }).serialize();
        
        $(plugin.style('alert','base', true)).hide();

        plugin.ajax({
          method: _url.type,
          url: _url.url,
          data: _data,
          beforeSend: function () {
            plugin.removeErrors($this);
          },
          success: function (data) {
            plugin.processUpdate($this, data);
          }
        });
        return this.callback('onUpdate');
      },

      del: function ($this) {
        var plugin = this;
        if (confirm(plugin.lang('confirm'))) {
          plugin.ajax({
            url: $this.attr('data-href'),
            method: 'DELETE',
            success: function (data) {
              plugin.log(data);
              if (data.success == true) {
                plugin.render().success(plugin.lang('deleted'))
              } else plugin.error(data.errors);
            }
          });
        }
        return this.callback('onDel');
      },

      render: function () {
        var plugin = this;
        plugin.ajax({
          url: this.listUrl(),
          beforeSend: function () {
            plugin.loading();
          },
          complete: function () {
            plugin.loaded();
          },
          success: function (data) {
            plugin.log(data.results);
            if (data.success == true) {
              if(data.results.total > 0){
                plugin.renderTemplate(data, plugin.settings.templates.row).save();
              } else plugin.renderTemplate(false, plugin.settings.templates.noresults).save();
            } else plugin.error(data.errors);
          }
        });
        return this.callback('onRender');
      },

    /* plugin functions */
      ajax: function (options) {
        var plugin = this;
        var defaults = {
          method:      'GET',
          dataType:    'json',
          error: function (xhr) {
            plugin.error(plugin.xhrError(xhr), false, true);
          }
        },
        settings = $.extend({}, defaults, options);

        $.ajax({
          method: settings.method,
          url: settings.url,
          dataType: settings.dataType,
          data: settings.data,
          beforeSend: settings.beforeSend,
          error: settings.error,
          complete: settings.complete,
          success: settings.success
        });

        return this.callback('onAjax');
      },

      callback: function (action) {
        if (typeof this.settings[action] === 'undefined') return this;
        var onComplete = this.settings[action];

        if (typeof onComplete === 'function') {
          onComplete.call(this.element);
        }
        return this;
      },

      xhrError: function (xhr) {
        var _message = this.lang('errors', xhr.status);
        return _message ? _message : xhr.status;
      }, 

      save: function () {
        /* TO-DO: convert to object and loop */
        this.saveLocalStorage('limit', this.settings.list.limit)
        this.saveLocalStorage('sort', this.settings.list.sort)
        this.saveLocalStorage('direction', this.settings.list.direction)
        this.saveLocalStorage('search', this.settings.list.search)
        this.saveLocalStorage('list_url', this.list_url)
        return this.callback('onSave');
      },

    /* visual */
      style: function(base, sub, p) {
        var _style = sub 
                      ? this.settings.styles[base][sub]
                      : this.settings.styles[base];
        return p 
             ? '.' + _style
             : _style;
      },

      success: function (message, target) {
        this.alert(this.style('alert','alert_success'), message, target).callback('onSuccess');
        return this.callback('onSuccess');
      },

      error: function (message, target, close) {
        if(close) $('.modal').modal('hide');
        this.alert(this.style('alert','alert_danger'), message, target).callback('onError');
        return this.callback('onError');
      },

      alert: function (style, message, target) {
        if (target) {
          target = $(target).find(this.style('alert','base', true));
        } else target = $(this.style('alert','base', true));

        var _alert = target.removeClass(
                            this.style('alert','alert_success') + ' ' + this.style('alert','alert_danger')
                            ).addClass(style).html('<strong>' + message + '</strong>').show();
        clearTimeout(this.alert_timeout);
        this.alert_timeout = setTimeout(function () {
          _alert.hide();
        }, 3000);
        return this.callback('onAlert');
      },

      loading: function () {
        $(this.element).find(this.style('refresh','btn_refresh', true)).find(this.style('em')).addClass(this.style('refresh','fa_spin'));
        return this.callback('onLoading');
      },

      loaded: function () {
        $(this.element).find(this.style('refresh','btn_refresh', true)).find(this.style('em')).removeClass(this.style('refresh','fa_spin'));
        return this.callback('onLoaded');
      },

      sortStyle: function (_this, direction) {
        _this.parents(this.style('thead')).find(this.style('sort', 'em', true)).removeClass(this.style('sort', 'sort_asc') + ' ' + this.style('sort', 'sort_desc')).addClass(this.style('sort', 'fa'));
        _this.find(this.style('sort', 'em', true)).removeClass(this.style('sort', 'fa')).addClass(this.style('sort', 'fa') +'-' + this.settings.list.direction);
        return this.callback('onSortStyle');
      },

      renderTemplate: function (data, tpl) {
        var _data = data ? data.results.data : false;
        $(this.element).find(this.style('tbody')).html($.templates(tpl).render(_data));
        if(_data) $(this.element).find(this.style('pagination', '', true)).html($.templates(this.settings.templates.pagination).render(data.results));
        return this.callback('onRenderTemplate');
      },

      removeErrors: function (_this) {
        _this.find(this.style('error','has_error', true)).removeClass(this.style('error','has_error'));
        _this.find(this.style('error','has_error', true)).addClass(this.style('hide'));
        return this.callback('onRemoveErrors');
      },

      validation: function (_this, data) {
        this[this.settings.validation](_this, data);
        return this.callback('onValidation');
      },

      validateLaravel: function(_this, data) {
        var plugin = this;
        $(data.errors).each(function (i, errors) {
          _this.find('[name="' + errors.field + '"]')
            .parents(plugin.style('form_group', '', true))
            .addClass(plugin.style('error','has_error'))
            .find(plugin.style('error','help_block', true))
            .removeClass(plugin.style('hide'))
            .find(plugin.style('error','strong')).html(errors.error);
        });
        return this.callback('onValidateLaravel');
      },

    /* helpers */
      setting: function(base, sub){
       if(typeof this.settings[base] == 'undefined' || (sub && typeof this.settings[base][sub] == 'undefined')) return '';
       return sub
                      ? this.settings[base][sub]
                      : this.settings[base];
      },

      lang: function(base, sub){
       /* TO-DO: clean this up, functionize it and share with the setting lang and template helpers */
       if(typeof this.settings.lang[base] == 'undefined' || (sub && typeof this.settings.lang[base][sub] == 'undefined')) return '';
       return sub
                      ? this.settings.lang[base][sub]
                      : this.settings.lang[base];
      },
     
      saveLocalStorage: function (vr, vl) {
        localStorage.setItem(this.settings.slug + '_' + vr, vl);
        return this.callback('onSaveLocalStorage');
      },

      getLocalStorage: function (vr) {
        return localStorage.getItem(this.settings.slug + '_' + vr);
      },

      log: function (data) {
        return this.callback('onLog');
      },

      processUpdate: function (_this, data) {
        this.log(data);
        if (data.success == true) {
          $('input', _this).each(function () {
            var _type = this.type;
            if(_type == 'text' || _type == 'textarea'){
              this.defaultValue = this.value
            } else if(_type = 'select'){
              this.defaultSelected = this.selected
            } else if(_type = 'checkbox' || _type == 'radio')
               this.defaultChecked = this.checked
         });
          this.render().success(this.lang('saved'), this.settings.selectors.modal);
        } else if (typeof data.errors == 'object') {
          this.validation(_this, data);
        } else if (data.errors) this.error(data.errors);
        return this.callback('onProcessUpdate');
      },

      updateUrl: function (_this) {
        var _url = _this.attr('action'),
          _patch = _this.find(this.settings.selectors.id).val();

        if (_patch) {
          var _type = 'PATCH';
          _url += '/' + _patch;
        } else var _type = 'POST';

        this.callback('onUpdateUrl');
        return {
          url: _url,
          type: _type
        };
      },
     
      listUrl: function () {
        return this[this.settings.listtype]();
      },

      listLaravel: function () {
       /* TO-DO: move variables to settings so they can be defined */
        var _url = this.list_url;
        _url += (_url.indexOf('?') > -1) ? '&' : '?page=1';
        if (this.settings.list.search) _url += '&search=' + encodeURIComponent(this.settings.list.search);
        _url += '&sort=' + this.settings.list.sort;
        _url += '&direction=' + this.settings.list.direction;
        _url += '&limit=' + this.settings.list.limit;
        return _url;
      },

    /* setters */
      setUrl: function (url) {
        this.list_url = url ? url : this.default_list_url;
        return this;
      },

      setLimit: function (_limit) {
        this.settings.list.limit = _limit;
        return this;
      },

      setSearch: function (_search) {
        this.settings.list.search = _search;
        return this;
      },

      setSort: function (_sort) {
        this.settings.list.sort = _sort;
        return this;
      },

      setDirection: function (_direction) {
        this.settings.list.direction = _direction;
        return this;
      },

    /* triggers */
      triggerCreate: function (_this) {
        this.doCreateRead(this.setting('create')).callback('onTriggerCreate');
        return this;
      },

      triggerRead: function (data) {
        this.doCreateRead(data.results).callback('onTriggerRead');
        return this;
      },

      doCreateRead: function(data){
        $(this.element).find(this.setting('selectors', 'update')).empty().html($.templates(this.setting('templates', 'create_edit')).render(data));
        return this;
      }

  });

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" +
          pluginName, new Plugin(this, options));
      }
    });
  };
})(jQuery);
