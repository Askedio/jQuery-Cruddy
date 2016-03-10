# jQuery-Cruddy
A CRUD plugin for jQuery &amp; Bootstrap to easily generate tables, create, and edit dialogs

[DOWNLOAD V1](https://github.com/Askedio/jQuery-Cruddy/archive/v1.zip)

[Live Demo](https://cruddy.io/app/)

![Example](http://i.imgur.com/TY5cutl.png)

# Usage
~~~
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css" rel='stylesheet' type='text/css'>
<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.rawgit.com/Askedio/jQuery-Cruddy/master/src/css/jquery-cruddy.css" rel="stylesheet">


<!-- INSERT TEMPLATE HERE -->

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jsrender/0.9.73/jsrender.min.js"></script>
<script src="https://cdn.rawgit.com/Askedio/jQuery-Cruddy/master/src/js/jquery-cruddy.js"></script>

<script>
  $('.container-user').cruddy();
</script>
~~~

# Template

[Default Template Example](https://raw.githubusercontent.com/Askedio/jQuery-Cruddy/master/tests/index.html)

data-href=

Look for the data-href=, these are what will be used for your urls - adjust them to match your json api.

# Settings
~~~
  var pluginName = 'cruddy',
    defaults = {
      strict:         true,                                     /* force [send|receive] headers to be application/vnd.api+json */
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
~~~
