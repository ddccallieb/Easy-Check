var checkboxTree = function(){
  
  var getCheckboxState= function($cb) {
    if ($cb.prop('indeterminate')) {
      return 2;
    }
    if ($cb.prop('checked')) {
      return 1;
    }
    return 0;	
  };
  
  var setCheckboxState = function($cb, newState) {
    var oldState = getCheckboxState($cb);
    if (newState !== oldState) {
      if (2 == newState) {
        $cb.prop('indeterminate', true);
      } else {
        $cb.prop('indeterminate', false);
        $cb.prop('checked', newState);
      }
      return true;
    }
    return false;
  };
  
  var changeCheckboxDown = function($cb) {
    var newState = getCheckboxState($cb);
    $cb.parent().find('input[type="checkbox"]').each(function (i, cb) {
      setCheckboxState($(cb), newState);
    });
  };
  
  var changeCheckboxUp = function($cb) {
    var $parents = $cb.parents('.list-group-item');
    
    if ($parents.length > 1) {
      var $listItem = $( $parents.get(1) );
      var $checkbox = $listItem.children('input[type="checkbox"]');
      var $childCbs = $listItem.children('.list-group').children('.list-group-item').children('input[type="checkbox"]');

      var newState;
      var childrenOn = 0;
      var childrenOff = 0;
      
      $childCbs.each(function (i, cb) {
        var childState = getCheckboxState($(cb));
      
        if (childState) {
          childrenOn++;
        } else {
          childrenOff++;
        }
        
        if (childrenOn > 0 && childrenOff > 0) {
          newState = 2;
        }
        else {
          newState = (childrenOff > 0) ? 0 : 1;
        }
      });

      if (setCheckboxState($checkbox, newState)) {
        changeCheckboxUp($checkbox);
      }
    }
  };
  
  var createListItem = function(name, label) {
    var markup = "<input type='checkbox' name='"+ name +"' /><a class='tree-toggle'>"+ label +"</a>";
    markup += "<span class='child-counter'></span>";
    markup += "<a class='add-new btn btn-small' href='#'>New Folder</a>";
    return markup;
  };
  
  var createNewFolder = function($new) {
    var $toggle = $new.siblings('.tree-toggle');
    var $childUL = $new.siblings('.list-group');
    if($childUL.length === 0 ){
      $new.after("<ul class='tree list-group'/>");
      $childUL = $new.siblings('.list-group');
    }
    
    var $newFolder = $("<li class='list-group-item'>" +createListItem('_temp', '') + "</li>");
    var $tempInput = $('<input/>', {class: 'new-folder-input', type: 'text'});
    $newFolder.find('.tree-toggle').hide().after($tempInput);

    $childUL.append($newFolder);
    
    if($childUL.is(':hidden')) {
      $toggle.trigger('click');
    }
    $tempInput.focus();
    $newFolder.on('keypress', '.new-folder-input', function (ev) {
      if (ev.keyCode === 13) {
          ev.preventDefault();
          var newValue = $tempInput.val();
          $toggle.removeClass('no-children');
          $newFolder.find('.tree-toggle').html(newValue).show();
          $newFolder.find('input[type="checkbox"]').prop('name', newValue);
          
          $tempInput.remove();
          updateCounts();
          return false;
        }
    });
    
    $tempInput.blur(function(){
      if($tempInput.val() ===''){
        $newFolder.remove();
      }  
    });
  };
  
  var updateCounts = function(){
    $('.list-group-item').each(function (i, lgi) {
      var $lgi = $(lgi);
      var childCount = $lgi.find('.list-group-item').length;
      $lgi.find('.child-counter').text(childCount);
      if (childCount === 0){
        $lgi.find('.tree-toggle').addClass('no-children');
      }
    });
  };
  
  var setupBindings = function(selector) {
    var $parentEl = $(selector);
    
    $parentEl.on('mouseenter', '.list-group-item', function(ev){
      ev.stopPropagation();
      var $li = $(this);
      $li.parents('.list-group-item').find('>.add-new').hide();
      if ( !$li.find('.list-group-item > .add-new:visible').length ) {
        $li.find('>.add-new').show();
      }
    });
        
    $parentEl.on('mouseleave', '.list-group-item', function(ev){
      var li = $(this);
      li.find('>.add-new').hide();
      li.parents('.list-group-item:first').find('>.add-new').show();
    }); 
    
    $parentEl.on('click', '.add-new', function(){
      var $this = $(this);
      createNewFolder($this);
    });
    
    $parentEl.on('click', '.tree-toggle', function () {
      $(this).parent().children('.list-group').not('.no-children').slideToggle(100);
    });
    
    $(selector).on('click', 'input[type="checkbox"]', function () {
      var $cb = $(this);
      changeCheckboxDown($cb);
      changeCheckboxUp($cb);
    });
  };
  
  var createTree = function(selector, data) {
    var markup = "<ul class='tree tree-parent list-group'>";
    markup += "<li class='list-group-item'>";
    markup += createListItem(data.md5, data.name);
    
    var createMarkup = function(data) {
      markup += "<ul class='tree list-group'>";
      if (data.children.length > 0) {
        data.children.forEach(function(item){
          markup += "<li class='list-group-item'>";
          markup += createListItem(item.md5, item.name);
          createMarkup(item);
          markup += "</li>";
        });
      }
      markup += "</li></ul>";
    };
    
    createMarkup(data);
    
    setupBindings(selector);
    $(selector).html(markup);
    updateCounts();
  };

  return {
    create: createTree 
  };
  
}();


$(document).ready(function() {
   
  checkboxTree.create('#tree-view', data);
  // $.ajax({
  //   url: 'data.js', 
  //   error: function(){
  //     
  //   },
  //   success: function(data){
  //     $('#tree-view').html(checkboxTree.create(data));
  //   }
  // });

});
  
  
  
