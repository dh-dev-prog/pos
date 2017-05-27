(function(){
  var model = {

    clicked: null,
    drinkList:[],
    Num: '',
    quantity: true,
    charge: true,
    cash: false,

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

    total: function() {
      var sum = this.drinkList.reduce(function(acc, obj){
        return acc + obj.total(obj.count);
      }, 0)
      return sum;
    }
  };


  var octopus = {

    init: function(){
      this.add();
      this.createButton();
      viewPanel.init();
      viewTable.init();
      viewCalculator.init();
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
    createButton: function(){
      model.drinkList.forEach(function(obj){
        var el = obj['button'];
        viewPanel.render(el);
      });
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
      var price = model.clicked.total(count);
      var row = model.clicked.row;
      var total = model.total();
      viewTable.renderRow(name, count, price, total);
    },

    moveOnCash: function() {
      if(viewPanel.calculator.classList.contains('is__active')){
        viewPanel.arrow.click();
      }
      if(viewTable.quantity) {
        viewTable.quantity.innerHTML = '+ ' + 0;
      }
      viewPanel.arrow.click(); //simulate a click on the arrow button to show the calculator
      model.Num = '';
      model.charge = false;
      model.cash = true;
      viewPanel.arrow.removeEventListener('click', viewPanel.toggleArrow);
    },
    getChange: function() {
      var refund = Number(model.Num) - model.total();
      viewTable.renderRefund(refund);
      model.Num = ''; //if not reset then next command will start with this num. if payed 36$, then next will be 36 x items
      model.cash = false;
      model.quantity = false;
    },
    clear: function() {
      model.Num = '';
      octopus.addNumber(0);
    },
    reset: function(){
      model.Num = ''; //same than getChange
      viewTable.tbody.innerHTML = '';
      viewTable.total.innerHTML = 0; //reset charge
      viewTable.renderQuantity(0);
      viewTable.renderCash(0);
      viewTable.renderRefund(0);
      model.drinkList.forEach(function(obj){
        obj["count"] = 0;
      })
      model.charge = true;
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
    }
  };

  var viewPanel = {

    init: function(){
      this.list = document.getElementById('list');
      this.listItem = this.list.getElementsByTagName('li');
      this.arrow = document.getElementById('arrow');
      this.drinks = document.querySelector('.drink');
      this.calculator = document.querySelector('.calculator');

      // ----------------------------------------- update rows when item clicked
      function clickItem(el) {
        var name = el.textContent;
        octopus.updateCurrObj(name);
        octopus.updateCountObj();
        octopus.getItem(name);
      }
      for (var i = 0; i < this.listItem.length; i++) {
        this.listItem[i].addEventListener('click', function(){
          clickItem(this);
        });
      }

      // ------------------------------------------- Toggle panel on arrow click

      this.toggleArrow = function (){ //use this.name = function in order to use it in an other interface
        this.firstChild.classList.toggle('ion-chevron-left');
        this.firstChild.classList.toggle('ion-chevron-right');
        viewPanel.drinks.classList.toggle('is__hidden');
        viewPanel.calculator.classList.toggle('is__active');
      };
      this.arrow.addEventListener('click', this.toggleArrow); // this will allow to remove the event in viewTable
    },
    render: function(el){
      list.innerHTML += el;
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

      // ----------------------------------------------------- Starting settings
      this.quantity.innerHTML = '+ ' + 0;
      this.total.innerHTML = 0;
      this.cash.querySelector('.button__text_num').innerHTML = 0;
      this.charge.querySelector('.button__text_num').innerHTML = 0;
      this.refund.querySelector('.button__text_num').innerHTML = 0;

      // ------------------------------------------------- Charge Button Clicked

      function chargeClick() {
        if (model.charge && Number(viewTable.charge.querySelector('.button__text_num').innerHTML) !== 0) {
          octopus.moveOnCash();
          viewTable.charge.querySelector('.button__text_title').classList.remove('button__on');
          viewTable.cash.querySelector('.button__text_title').classList.add('button__on');
        } else {
          return;
        }
      }
      this.charge.addEventListener('click', chargeClick);


      //--------------------------------------------- Show the change difference

      function cashClick(){
        //if cashCount has been clicked once do nothing - second click compare cash to 0 and refund become negative
        if (!model.cash){
          return;
        }
        var cashNum = viewTable.cash.querySelector('.button__text_num').innerHTML;
        var chargeNum = viewTable.charge.querySelector('.button__text_num').innerHTML;
        var msg  = document.createElement('div');
        var warning = document.createTextNode('not enough!');
        var ok = document.createTextNode('ok, good to go!');
        var el = viewTable.cash.parentNode.querySelector('.warning');

        msg.setAttribute('class', 'warning');

        // ------------------------------------------- If Cash is not sufficient
        if (Number(cashNum) >= Number(chargeNum)) {
          if(el) { // if msg warning on page
            viewTable.cash.parentNode.removeChild(el);
            msg.appendChild(ok);
            viewTable.cash.parentNode.appendChild(msg);
            octopus.getChange(); // put ok message and call change-cash compare function
          } else { // if all good
            // or if no message call change-cash compare function
            octopus.getChange();
          }
        } else { // if cash is not sufficient
          if(el) { // if msg warning on page
            return;
          } else {
            msg.appendChild(warning);
            viewTable.cash.parentNode.appendChild(msg);
            octopus.clear(); // clear to put cash value back to zero;
          }
        }
      };
      this.cash.addEventListener('click', cashClick);

      // ---------------------------------------------------------- Reset button
      this.reset.addEventListener('click', function(){
        octopus.reset();
      });
    },

    renderRow: function(name, count, price, total) {
      var row = document.getElementById(name);
      var sum = 0;

      if(row){ // if row already exists, has an id
        var counter = row.getElementsByTagName('td')[1]; // get second cell (quantity)
        var priceCell = counter.nextSibling;
        counter.innerHTML = count;
        priceCell.innerHTML = price + '$';
        this.total.innerHTML = total;
      } else {
        row = '<tr id="' + name + '"><td>' + name + '</td><td>' + count + '</td><td class="price">' + price + '$ </tr>';
        this.tbody.innerHTML += row;
        this.charge.querySelector('.button__text_title').classList.add('button__on');
        this.total.innerHTML = total;
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
        octopus.clear();
      })
    }
  }
  octopus.init();
}());
