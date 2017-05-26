(function(){
  var model = {
    clicked: null,
    drinkList:[],
    currentNum: '',
    numA: 0,
    total: 0,
    pay: false,
    charge: false,
    Drink: function(name,price){
      this.name = name;
      this.price = price;
      this.count = 0;
      this.button = '<li class="drink__item">' + this.name + '</li>';
      this.row = '<tr id="' + this.name.toLowerCase() + '"><td>' + this.name + '</td><td>' + this.count + '</td><td class="price">' + this.total + '$ </tr>';
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
    updateCountObj: function() {
      //if num entered then update item count by this number, else count++.
      //!!currentNum has to be reinitialised everytime or next item will be update by this number too
      if (model.currentNum) {
        model.clicked.count += Number(model.currentNum);
        model.currentNum = '';
      } else {
        model.clicked.count++;
      }
      // reinitialise quantity counter
      viewTable.renderNumber(0);
    },
    addNumber: function(num){
      model.currentNum += num;
      if (model.pay) {
        viewTable.renderPayMode(Number(model.currentNum));
      } else {
        viewTable.renderNumber(Number(model.currentNum));
      }
    },
    getItem: function(name){
      var count = model.clicked.count;
      var price = model.clicked.price;
      var total = model.clicked.total(count);
      var row = model.clicked.row;
      var bigTotal = model.bigTotal();
      viewTable.render(name,count,price,total, bigTotal, row);
    },
    total: function(total){
      if (model.pay) {
        viewTable.renderPayMode(total);
      } else {
        viewTable.renderNumber(total);
      }
    },
    getChange: function() {
      var change = Number(model.currentNum) - model.bigTotal();
      viewTable.renderRefund(change);
      model.currentNum = ''; //if not reset then next command will start with this num. if payed 36$, then next will be 36 x items
    },
    reset: function(){
      model.currentNum = ''; //same than getChange
      viewTable.tbody.innerHTML = '';
      viewTable.bigTotal.innerHTML = 0 + '$';
      model.numA = 0;
      model.numB = 0;
      model.total = 0;
      viewTable.renderNumber(0);
      viewTable.renderPayMode(0);
      viewTable.renderRefund(0);
      model.drinkList.forEach(function(obj){
        obj["count"] = 0;
      })
      model.pay = false;
      viewPanel.arrow.click();
    }
  };
  var viewPanel = {
    init: function(){
      this.list = document.getElementById('list');
      this.arrow = document.getElementById('arrow');
      this.drinks = document.querySelector('.drink');
      this.calculator = document.querySelector('.calculator');

      model.drinkList.forEach(function(obj){
        var el = obj['button'];
        list.innerHTML += el;
      });
      this.list.addEventListener('click', function(e){
        e.preventDefault();
        var target = e.target;
        var name = target.textContent;
        octopus.updateCurrObj(name);
        octopus.updateCountObj();
        octopus.getItem(name);
      });
      this.arrow.addEventListener('click', function(){
        this.firstChild.classList.toggle('ion-chevron-left');
        this.firstChild.classList.toggle('ion-chevron-right');
        viewPanel.drinks.classList.toggle('is__hidden');
        viewPanel.calculator.classList.toggle('is__active');
      })
    }
  };
  var viewTable = {
    init: function(){
      this.tbody      = document.querySelector('tbody');
      this.bigTotal   = document.getElementById('bigTotal');
      this.charge     = document.getElementById('charge');
      this.reset      = document.getElementById('reset');
      this.money      = document.getElementById('money');
      this.pay        = document.getElementById('pay');
      this.refund     = document.getElementById('refund');
      this.showNumber = document.getElementById('showNumber');
      this.quantity   = document.getElementById('quantity');

      this.showNumber.innerHTML = 'Total: ' + 0 + '$';
      this.quantity.innerHTML = 0;
      this.bigTotal.innerHTML   = 0;
      this.money.querySelector('.button__text_big').innerHTML = 0 + '$';
      this.charge.querySelector('.button__text_big').innerHTML = 0 + '$';
      this.refund.innerHTML     = 'Refund: ' + 0 + '$';

      this.charge.addEventListener('click', function(e){
        e.preventDefault();
        viewPanel.arrow.click();
        var total = viewTable.bigTotal.innerHTML;
        viewTable.showNumber.innerHTML = 'Total: ' + total;
        model.currentNum = '';
        model.pay = true;
      });
      //Show the change difference
      this.money.addEventListener('click', function(e){
        e.preventDefault();
        octopus.getChange();
      });
      this.reset.addEventListener('click', function(){
        octopus.reset();
      });
    },
    render: function(name, count, price, total, bigTotal, row){
      var rowByName = document.getElementById(name);
      var sum = 0;
      if(rowByName){                                                            //if a row with an this name as id already exists
        var counter = rowByName.getElementsByTagName('td')[1];                  // or rowByName.firstChild.nextSibling // if rowByName doesnt exist, cant read his Tags so var cant be on top scope
        var rowTotal = counter.nextSibling;
        counter.innerHTML = count;
        rowTotal.innerHTML = total + '$';
        this.bigTotal.innerHTML = bigTotal + '$';
      } else {
        row = '<tr id="' + name + '"><td>' + name + '</td><td>' + count + '</td><td class="price">' + total + '$ </tr>';
        this.tbody.innerHTML += row;
        this.bigTotal.innerHTML = bigTotal + '$';
      }
    },
    renderNumber: function(num){
      this.quantity.innerHTML = num;
    },
    renderPayMode: function(num) {
      this.money.querySelector('.button__text_big').innerHTML = num + '$';
    },
    renderRefund: function(num) {
      this.refund.innerHTML = 'Refund: ' + num + '$';
    }
  }

  var viewCalculator = {

    init: function(){
      this.numbers    = document.getElementsByClassName('number');
      this.list       = document.querySelector('.calculator');
      this.switch     = document.getElementById('switch_calculator');
      console.log(this.numbers);
      // Get the Numbers
      function getNumber(e){
        var target = e.target;
        var id = target.id;
        if(target.getAttribute('class').split(' ')[0] === 'number'){
          octopus.addNumber(id);
        } else if (target.getAttribute('class').split(' ')[0] === 'operator') {
          octopus.passOperator(id);
        }
      };

      //Clicked number on screen
      this.list.addEventListener('click', getNumber);
      //Touch key number on Keyboard
      document.addEventListener('keydown', function(e){
        var key = e.key;
        document.getElementById(key).click();
      }, true);
    },
  }
  octopus.init();
}());
