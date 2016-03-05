# jQuery-Cruddy
A CRUD plugin for jQuery &amp; Bootstrap to easily generate tables, create, and edit dialogs

[Live Demo](https://cruddy.io/app/)

![Example](http://i.imgur.com/TY5cutl.png)

# Usage
~~~
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css" rel='stylesheet' type='text/css'>
<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.rawgit.com/Askedio/jQuery-Cruddy/master/src/css/jquery-cruddy.css" rel="stylesheet">

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jsrender/0.9.73/jsrender.min.js"></script>
<script src="https://cdn.rawgit.com/Askedio/jQuery-Cruddy/master/src/js/jquery-cruddy.js"></script>

<script>
  $('.container-user').cruddy();
</script>
~~~

# Settings
~~~
defaults = {
      slug:           'users',
      validation:     'validateLaravel',
      listtype:       'listLaravel',

      templates: {
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
        failed:       'Request failed!'
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
~~~
