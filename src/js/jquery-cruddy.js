/*
  The MIT License (MIT)

  Copyright (c) 2016 William Bowman, gcphost@gmail.com, Asked.io, Cruddy.io

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/


/* TO-DO:
 *
 * cache selectors 
 * clean up names of variables/functions
 * clean up 'helpers' to get lang, setting, selector, style this.setting('selectors.modal')
 * clean up css/id variables being used to be more uniform - cruddy-## or something
 * abstract API related variables, fields, results, write Laravel helper
 * 
 * 
 * BUGS/ISSUES
 * 
 * POST/PATCH is {name:value} json array for body, not json api spec
 * 
 * 
*/




;
(function ($, window, document, undefined) {

  'use strict';

  var pluginName = 'cruddy',
    defaults = {
      strict:         true,                                    /* force [send|receive] headers to be application/vnd.api+json */
      slug:           'users',                                  /* slug used to cache local settings like url,sort,search */
      validation:     'validateLaravel',                        /* the function used to validate form errors */
      listtype:       'listLaravel',                            /* the function used to generate lists */
      autofocus:      true,                                     /* auto focus first visible input in modal when [edit|create] */

      templates: {
        noresults :   '#no-results',                            /* the jsrender template for no results */
        create_edit:  '#create-edit',                           /* the jsrender template for [create|edit] modal */
        pagination:   '#list-pagination',                       /* the jsrender template for the pagination */
        row:          '#row-item'                               /* the jsrender template for results */
      },

      selectors: {
        create:       '.btn-create',                            /* the button used to trigger the create modal */
        del:          'button[data-action="delete"]',           /* the button used to delete a list item */
        id:           'input[name="id"]',                       /* the (hidden) input used to as the id for the user */
        limit:        '[name="limit"]',                         /* the input used to define the list limit */
        modal:        '#modal-create-edit',                     /* the modal for [create|edit] */
        refresh:      '.btn-refresh',                           /* the button used to refresh list data */
        pagination:   '.pagination > li > span',                /* the paginatied elements used for next/prev */
        read:         'button[data-action="read"]',             /* the button used to edit a list item */
        search:       '.search',                                /* the input used for searching the list */
        search_field: 'input[name="q"]',                        /* .. */
        sort:         'th[data-col]',                           /* the attibute to use for sorting the list */
        table:        '.table-list',                            /* the list table */
        update:       '.create-edit'                            /* the form used in [create|edit] modal */
      },

      styles: {
        tbody:              'table tbody',                      /* the lists tbody */
        thead:              'thead',                            /* the lists thead */
        pagination:         'list-pagination',                  /* the lists pagination container */
        hide:               'hide',                             /* invisible elements */
        form_group:         'form-group',                       /* form item groups */
        em:                 'em',                               /* used for icons [em|i] */

        alert: {
          base:             'alert-control',                    /* base alert */
          alert_success:    'alert-success',                    /* alert ok */
          alert_danger:     'alert-danger'                      /* alert not ok */
        },

        refresh: {
          btn_refresh:      'btn-refresh',                      /* refresh btn */
          fa_spin:          'fa-spin'                           /* spin */
        },

        sort: {
          em:               'em-sort',                          /* use this icon for sort arrow changes */
          fa:               'fa-sort',                          /* base sort icon */
          sort_asc:         'fa-sort-asc',                      /* asc icon */
          sort_desc:        'fa-sort-desc'                      /* desc icon */
        },

        error: {
          has_error:        'has-error',                        /* form error  */
          help_block:       'help-block',                       /* form block */
          strong:           'strong'                            /* element in the error */
        }
      },

      lang: {
        saved:        'Saved',                                  /* alert save */         
        deleted:      'Deleted',                                /* alert deleted */
        confirm:      'Are you sure?',                          /* confirm delete */
        errors:       {                                         /* translate error codes to messages, new json api will be different */
                        default:     'Error',                   
                        500:         'Internal Server Error',
                        404:         'Not Found',
                        415:         'Unsupported Media Type',
                        406:         'Not Acceptable'
                      }
      },

      list: {
        direction:    'asc',                                    /* default sort direction */
        limit:        10,                                       /* default limit */
        sort:         'id',                                     /* default sort id  */
        search:       ''                                        /* default search  */
      },

      create: {                                                 /* define data your templates.create_edit requires */
        attributes: {
          id:           '',
          name:         '',
          email:        ''
        }
     },

     onConfirm:    function($this, string, $ele){
       return confirm(string);
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
          plugin.read.call(plugin, $(this).attr('data-href'));
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
        return this.render().callback('onRefresh', $this);
      },

      pagination: function ($this) {
        return this.setUrl($this.attr('data-href')).render().callback('onPagination', $this);
      },

      limit: function ($this) {
        return this.setUrl().setLimit($this.val()).render().callback('onLimit', $this);
      },

      search: function ($this) {
        return this.setUrl().setSearch($this.find(this.settings.selectors.search_field).val()).render().callback('onSearch', $this);
      },

      sort: function ($this) {
        return this.setSort($this.attr('data-col')).sortStyle($this, this.settings.list.direction).setDirection(this.settings.list.direction == 'asc' ? 'desc' : 'asc').render().callback('onSort', $this);
      },

      create: function ($this) {
        return this.triggerCreate($this).callback('onCreate', $this);
      },
     
    /* ajax calls */
      read: function (url) {
        var plugin = this;
        plugin.ajax({
          url: url,
          success: function (data) {
            plugin.log(data);
            plugin.triggerRead(data);
          }
        });
        return this.callback('onRead', url);
      },

      update: function ($this) {
        /* TO-DO: move data to its own function */
        var plugin = this,
          _url     = this.updateUrl($this),
          _data    = {};

           $('input', $this).filter(function () {
              var _type = this.type;
              if(_type == 'text' || _type == 'textarea'){
                if(this.value != this.defaultValue) _data[this.name] = this.value;
              } else if(_type = 'select'){
                if(this.value != this.defaultSelected) _data[this.name] = this.value;
              } else if(_type = 'checkbox' || _type == 'radio')
                if(this.value != this.defaultChecked) _data[this.name] = this.value;
           }).serializeArray();

        $(plugin.style('alert','base', true)).hide();

        plugin.ajax({
          method: _url.type,
          url: _url.url,
          data: JSON.stringify(_data),
          beforeSend: function () {
            plugin.removeErrors($this);
          },
          success: function (data) {
            plugin.processUpdate($this, data);
          }
        });
        return this.callback('onUpdate', $this);
      },

      confirm: function (string) {
        return this.callback('onConfirm', string);
      },

      del: function ($this) {
        var plugin = this;
        if (plugin.confirm(plugin.lang('confirm'), $this)) {
          plugin.ajax({
            url: $this.attr('data-href'),
            method: 'DELETE',
            success: function (data) {
              plugin.log(data);
              plugin.render().success(plugin.lang('deleted'))
            }
          });
        }
        return this.callback('onDel', $this);
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
          success: function (data, status, xhr) {
            plugin.log(data);
            if(data.meta.total > 0){
              plugin.renderTemplate(data, plugin.settings.templates.row).save();
            } else plugin.renderTemplate(false, plugin.settings.templates.noresults).save();
          }
        });
        return this.callback('onRender');
      },

    /* plugin functions */
      hasErrors: function (data, status, xhr) {
        var _error = false;
        if(this.settings.strict && xhr.getResponseHeader('Content-Type') != 'application/vnd.api+json'){
          _error = this.lang('errors', 415);
        } else if(typeof data.errors !== 'undefined'){
          _error = data.errors;
        }

        if(_error){
          this.error(_error, false, true);
          return true;
        }
      }, 

      ajax: function (options) {
        var plugin = this,
            defaults = {
              method:      'GET',
              dataType:    'json',
              error: function (xhr) {
                xhr.status == 403 
                  ? plugin.validation($('.create-edit'), xhr.responseJSON)
                  : plugin.error(plugin.xhrError(xhr), false, true);
              },
              headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
              }
        };
        if(!this.settings.strict) defaults.headers = '';

        var settings = $.extend({}, defaults, options);

        $.ajax({
          method: settings.method,
          url: settings.url,
          dataType: settings.dataType,
          data: settings.data,
          beforeSend: settings.beforeSend,
          error: settings.error,
          complete: settings.complete,
          success: settings.success,
          headers: settings.headers
        });

        return this.callback('onAjax', settings);
      },

      callback: function (action, data) {
        if (typeof this.settings[action] === 'undefined') return this;
        var _function = this.settings[action];
        if (typeof _function === 'function') return _function.call(this.element, this, data);
        return this;
      },

      xhrError: function (xhr) {
        if(xhr.readyState == 0) xhr.status = 500;
        var _message = this.lang('errors', xhr.status);
        return _message ? _message : this.lang('errors', 'default');
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
        return this.alert(this.style('alert','alert_success'), message, target).callback('onSuccess', {
          message: message,
          target:   target
        });
      },

      error: function (message, target, close) {
        if(close) $('.modal').modal('hide');
        return this.alert(this.style('alert','alert_danger'), message, target).callback('onError', {
          message: message,
          target:   target
        });
      },

      alert: function (style, message, target) {
        if (target) {
          target = $(target).find(this.style('alert','base', true));
        } else target = $(this.style('alert','base', true));

        var _alert = target.removeClass(
                            this.style('alert','alert_success') + ' ' + this.style('alert','alert_danger')
                            ).addClass(style).html('<strong>' + message + '</strong>').show();
        clearTimeout(this.alert_timeout);
        this.alert_timeout = setTimeout(function (){
          _alert.hide();
        }, 3000);
        return this.callback('onAlert', {
          style:   style,
          message: message,
          target:  target
        });
      },

      loading: function () {
        $(this.element).find(this.style('refresh','btn_refresh', true)).find(this.style('em')).addClass(this.style('refresh','fa_spin'));
        return this.callback('onLoading', $(this.element));
      },

      loaded: function () {
        $(this.element).find(this.style('refresh','btn_refresh', true)).find(this.style('em')).removeClass(this.style('refresh','fa_spin'));
        return this.callback('onLoaded', $(this.element));
      },

      sortStyle: function (_this, direction) {
        _this.parents(this.style('thead')).find(this.style('sort', 'em', true)).removeClass(this.style('sort', 'sort_asc') + ' ' + this.style('sort', 'sort_desc')).addClass(this.style('sort', 'fa'));
        _this.find(this.style('sort', 'em', true)).removeClass(this.style('sort', 'fa')).addClass(this.style('sort', 'fa') +'-' + this.settings.list.direction);
        return this.callback('onSortStyle', {
          'this' :   _this,
          direction: direction
        });
      },

      renderTemplate: function (data, tpl) {
        var _data = data ? data : false;
        $(this.element).find(this.style('tbody')).html($.templates(tpl).render(_data.data));
        if(_data) $(this.element).find(this.style('pagination', '', true)).html($.templates(this.settings.templates.pagination).render(data));
        return this.callback('onRenderTemplate', {
          data: data,
          tpl:  tpl
        });
      },

      removeErrors: function (_this) {
        _this.find(this.style('error','has_error', true)).removeClass(this.style('error','has_error'));
        _this.find(this.style('error','has_error', true)).addClass(this.style('hide'));
        return this.callback('onRemoveErrors', _this);
      },

      validation: function (_this, data) {
        this[this.settings.validation](_this, data);
        return this.callback('onValidation', {
          'this': _this,
          data:   data
        });
      },

      validateLaravel: function(_this, data) {
        var plugin = this;
        $(data.errors).each(function (i, errors) {
          _this.find('[name="' + errors.source.pointer + '"]')
            .parents(plugin.style('form_group', '', true))
            .addClass(plugin.style('error','has_error'))
            .find(plugin.style('error','help_block', true))
            .removeClass(plugin.style('hide'))
            .find(plugin.style('error','strong')).html(errors.detail);
        });
        return this.callback('onValidateLaravel', {
          'this': _this,
          data:   data
        });
      },

    /* helpers */
      setting: function(base, sub){
       if(typeof this.settings[base] === 'undefined' || (sub && typeof this.settings[base][sub] === 'undefined')) return '';
       return sub
                      ? this.settings[base][sub]
                      : this.settings[base];
      },

      lang: function(base, sub){
        /* TO-DO: still unhappy here, lets do some splits on . (error.404, confirm, some.setting)  and do a check loop to get the string */
        if(sub != '' && typeof this.settings.lang[base][sub] !== 'undefined') return  this.settings.lang[base][sub];
        if(typeof this.settings.lang[base] !== 'undefined') return this.settings.lang[base];
        return '';
      },
     
      saveLocalStorage: function (vr, vl) {
        localStorage.setItem(this.settings.slug + '_' + vr, vl);
        return this.callback('onSaveLocalStorage', {
          'var': vr,
          'val': vl
        });
      },

      getLocalStorage: function (vr) {
        return localStorage.getItem(this.settings.slug + '_' + vr);
      },

      log: function (data) {
        return this.callback('onLog', data);
      },

      processUpdate: function (_this, data) {
        var plugin = this;

        this.log(data);
        this.read($(_this).attr('action') + '/' + data.data.id).render();

        setTimeout(function(){
          plugin.success(plugin.lang('saved'), plugin.settings.selectors.modal);
        }, 700);

        return this.callback('onProcessUpdate', {
          'this': _this,
          data:   data
        });
      },

      updateUrl: function (_this) {
        var _url = _this.attr('action'),
          _patch = _this.find(this.settings.selectors.id).val();

        if (_patch) {
          var _type = 'PATCH';
          _url += '/' + _patch;
        } else var _type = 'POST';

        this.callback('onUpdateUrl', _this);
        return {
          url: _url,
          type: _type
        };
      },
     
      listUrl: function () {
        return this[this.settings.listtype]();
      },

      listLaravel: function () {
       /* TO-DO: move variables to settings so they can be defined, how to customize w/o new function? custom list? inline callbacks? */
        var _url = this.list_url;
        _url += (_url.indexOf('?') > -1) ? '&' : '?page[number]=1';
        if (this.settings.list.search) _url += '&search=' + encodeURIComponent(this.settings.list.search);
        _url += '&sort=' + (this.settings.list.direction == 'desc' ? '-' : '') + this.settings.list.sort;
        _url += '&page[limit]=' + this.settings.list.limit;
        return _url;
      },

    /* setters */
      setUrl: function (url) {
        this.list_url = url ? url : this.default_list_url;
        return this.callback('onSetUrl', url);
      },

      setLimit: function (_limit) {
        this.settings.list.limit = _limit;
        return this.callback('onSetLimit', _limit);
      },

      setSearch: function (_search) {
        this.settings.list.search = _search;
        return this.callback('onSetSearch', _search);
      },

      setSort: function (_sort) {
        this.settings.list.sort = _sort;
        return this.callback('onSetSort', _sort);
      },

      setDirection: function (_direction) {
        this.settings.list.direction = _direction;
        return this.callback('onSetDirection', _direction);
      },

    /* triggers */
      triggerCreate: function (_this) {
        return this.doCreateRead(this.setting('create')).callback('onTriggerCreate', _this);
      },

      triggerRead: function (data) {
        return this.doCreateRead(data.data).callback('onTriggerRead', data);
      },

      doCreateRead: function(data){
        $(this.element).find(this.setting('selectors', 'update'))
                    .empty()
                    .html(  
                      $.templates(this.setting('templates', 'create_edit')).render(data)
                    );
        return this.callback('onDoCreateRead', data);
      }

  });

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' +
          pluginName, new Plugin(this, options));
      }
    });
  };
})(jQuery);
