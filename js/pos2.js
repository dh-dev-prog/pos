(function(){


  var model = {

    clicked: null,
    drinkList:[],
    Num: '',
    cash: false,
    quantity: true,

    Drink: function(name,price){
      this.name = name;
      this.price = price;
      this.count = 0;
      this.button = '<li class="drink__item">' + this.name + '</li>';
      this.total = function(count){
        return count * this.price;
      }
      model.drinkList.push(this);
    },

    bigTotal: function() {
      var sum = this.drinkList.reduce(function(acc, obj){
        return acc + obj.total(obj.count);
      }, 0)
      return sum;
    }
  };


  var octopus = {

    init: function(){
      this.add();
      viewPanel.init();
      viewTable.init();
      viewCalculator.init();
      clearTimeout(viewTable.timeout);
    },

    add: function(){
      new model.Drink('Latte',4);
      new model.Drink('Cappuccino',4);
      new model.Drink('Espresso',2);
      new model.Drink('Moccha',5);
      new model.Drink('Caramel Latte',5);
      new model.Drink('Americano',3);
      new model.Drink('Drip',6);
      new model.Drink('Ice Latte',4);
      new model.Drink('Double Espresso',4);
      new model.Drink('Grosse Bertha',8);
      new model.Drink('Panzer',9);
      new model.Drink('Tombeau',15);
    },

    updateCurrObj: function(name){
      //Get the clicked item and related object
      model.clicked = model.drinkList.filter(function(drink){
        return drink.name === name;
      })[0];
    },

    addNumber: function(num){
      model.Num += num;
      if (model.cash) {
        viewTable.renderCash(Number(model.Num));
      } else if (model.quantity){
        viewTable.renderQuantity(Number(model.Num));
      }
    },

    updateCountObj: function() {
      //if num entered then update item count by this number, else count++.
      //!!Num has to be reinitialised everytime or next item will be update by this number too
      if (model.Num) {
        model.clicked.count += Number(model.Num);
        model.Num = '';
      } else {
        model.clicked.count++;
      }
      // reinitialise quantity counter when a number has been entered before an item was clicked
      viewTable.renderQuantity(0);
    },

    getItem: function(name){
      var count = model.clicked.count;
      var price = model.clicked.price;
      var total = model.clicked.total(count);
      var row = model.clicked.row;
      var bigTotal = model.bigTotal();
      viewTable.render(name, count, total, bigTotal);
    },

    getChange: function() {
      var refund = Number(model.Num) - model.bigTotal();
      viewTable.renderRefund(refund);
      model.Num = ''; //if not reset then next command will start with this num. if payed 36$, then next will be 36 x items
      model.cash = false;
      model.quantity = false;
    },

    reset: function(){
      model.Num = ''; //same than getChange
      viewTable.tbody.innerHTML = '';
      viewTable.total.innerHTML = 0;
      viewTable.renderQuantity(0);
      viewTable.renderCash(0);
      viewTable.renderRefund(0);
      model.drinkList.forEach(function(obj){
        obj["count"] = 0;
      })
      model.cash = false;
      model.quantity = true;

      viewTable.refund.querySelector('.button__text_title').classList.remove('button__on');
      viewTable.charge.querySelector('.button__text_num').style.color = '';
      viewTable.cash.querySelector('.button__text_num').style.color = '';
      viewTable.refund.querySelector('.button__text_num').style.color = '';

      viewPanel.arrow.addEventListener('click', viewPanel.toggleArrow);
      viewPanel.arrow.click();

      var el = viewTable.cash.parentNode.querySelector('.warning');
      if(el) {
        viewTable.cash.parentNode.removeChild(el);
      }

      viewTable.cashCount = 0;
    }
  };

  var viewPanel = {

    init: function(){
      this.list = document.getElementById('list');
      this.arrow = document.getElementById('arrow');
      this.drinks = document.querySelector('.drink');
      this.calculator = document.querySelector('.calculator');
      this.drink__item = document.getElementsByClassName('.drink__item')

      //create a button for each item
      model.drinkList.forEach(function(obj){
        var el = obj['button'];
        list.innerHTML += el;
      });
      //when item clicked, update rows in the table
      function clickItem(e) {
        e.preventDefault();
        var target = e.target;
        var name = target.textContent;
        octopus.updateCurrObj(name);
        octopus.updateCountObj();
        octopus.getItem(name);
      }
      this.list.addEventListener('click', clickItem);

      // arrow and panel toggle
      this.toggleArrow = function (){ //use this.name = function in order to use it in an other interface
        this.firstChild.classList.toggle('ion-chevron-left');
        this.firstChild.classList.toggle('ion-chevron-right');
        viewPanel.drinks.classList.toggle('is__hidden');
        viewPanel.calculator.classList.toggle('is__active');
      };
      this.arrow.addEventListener('click', this.toggleArrow); // this will allow to remove the event in viewTable
    }
  }

  var viewTable = {

    init: function(){
      this.tbody      = document.querySelector('tbody');
      this.quantity   = document.getElementById('quantity');
      this.charge     = document.getElementById('charge');
      this.total      = document.getElementById('total');
      this.cash       = document.getElementById('cash');
      this.refund     = document.getElementById('refund');
      this.reset      = document.getElementById('reset');
      this.cashCount = 0;

      this.quantity.innerHTML = '+ ' + 0;
      this.total.innerHTML = 0;
      this.cash.querySelector('.button__text_num').innerHTML = 0;
      this.charge.querySelector('.button__text_num').innerHTML = 0;
      this.refund.querySelector('.button__text_num').innerHTML = 0;

      this.charge.addEventListener('click', function(){

        viewPanel.arrow.click(); //simulate a click on the arrow button to show the calculator
        model.Num = '';
        model.cash = true;
        viewPanel.arrow.removeEventListener('click', viewPanel.toggleArrow);
        viewTable.charge.querySelector('.button__text_title').classList.remove('button__on');
        viewTable.cash.querySelector('.button__text_title').classList.add('button__on');

      });
      //Show the change difference
      this.cash.addEventListener('click', function(){
        if (viewTable.cashCount > 0){
          return;
        }
        var cashNum = viewTable.cash.querySelector('.button__text_num').innerHTML;
        var chargeNum = viewTable.charge.querySelector('.button__text_num').innerHTML;
        var msg  = document.createElement('div');
        var warning = document.createTextNode('not enough!');
        var ok = document.createTextNode('ok, good to go!');

        msg.setAttribute('class', 'warning');

        if (Number(cashNum) >= Number(chargeNum)) {
          viewTable.cashCount++;
          var el = viewTable.cash.parentNode.querySelector('.warning');
          if(el) {
            viewTable.cash.parentNode.removeChild(el);
            msg.appendChild(ok);
            viewTable.cash.parentNode.appendChild(msg);
            octopus.getChange();
          } else {
            octopus.getChange();
          }
        } else {
          msg.appendChild(warning);
          viewTable.cash.parentNode.appendChild(msg);
          viewCalculator.clear.click();
        }
      });
      // reset button
      this.reset.addEventListener('click', function(){
        octopus.reset();
      });
    },

    render: function(name, count, total, bigTotal) {

      var row = document.getElementById(name);
      var sum = 0;

      if(row){                                                            // if row already exists, has an id
        var counter = row.getElementsByTagName('td')[1];                  // get second cell (quantity)
        var price = counter.nextSibling;
        counter.innerHTML = count;
        price.innerHTML = total + '$';
        this.total.innerHTML = bigTotal;
      } else {
        row = '<tr id="' + name + '"><td>' + name + '</td><td>' + count + '</td><td class="price">' + total + '$ </tr>';
        this.tbody.innerHTML += row;
        this.charge.querySelector('.button__text_title').classList.add('button__on');
        this.total.innerHTML = bigTotal;
      }
    },

    renderQuantity: function(num){
      this.quantity.innerHTML = '+ ' + num;
    },

    renderCash: function(num) {
      this.cash.querySelector('.button__text_num').innerHTML = num;
    },

    renderRefund: function(num) {
      this.cash.querySelector('.button__text_title').classList.remove('button__on');
      this.refund.querySelector('.button__text_title').classList.add('button__on');
      this.refund.querySelector('.button__text_num').innerHTML = num;
    }
  };

  var viewCalculator = {

    init: function(){
      this.numbers    = document.getElementsByClassName('number');
      this.calculator = document.querySelector('.calculator');
      this.clear = document.getElementById('C');

      // Get the Numbers
      function getNumber(e){
        var target = e.target;
        if(target !== viewCalculator.clear) {
          var number = target.id;
          octopus.addNumber(number);
        }
      };
      //Clicked number on screen
      this.calculator.addEventListener('click', getNumber);
      this.clear.addEventListener('click', function(){
        model.Num = '';
        octopus.addNumber(0);
      })
    }
  }
  octopus.init();
}());
