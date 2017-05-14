(function(){
  var model = {
    clicked: null,
    drinkList:[],
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
    },
    // CALCULATOR
    currentNum: '',
    operator: [],
    numA: 0,
    numB: 0,
    total: 0,
    operation: {
      '+': function(a, b) { return a + b },
      '-': function(a, b) { return a - b },
      '*': function(a, b) { return a * b },
      '/': function(a, b) { return a / b },
    },
    calculator: function(){
      this.total = this.operation[this.operator[this.operator.length - 2]](this.numA, this.numB);
      this.numA = this.total;
      octopus.total(this.total);
    },
    pay: false,
    charge: false
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
      var clicked = model.drinkList.filter(function(drink){
        return drink.name === name;
      })
      model.clicked = clicked[0];
      if (Number(model.currentNum) !== 0) {                                     // if a number has been pressed
        model.clicked.count += Number(model.currentNum);                        // count is updated with number pressed
        model.currentNum = '';
        viewCalculator.showNumber.innerHTML = 0;                                         // currentNum back to zero (if not it will always update with the number pressed)
      } else if (model.numA !== 0){
        model.clicked.count += model.numA ;                        // count is updated with number pressed
        model.currentNum = '';
        model.numA = 0;
        viewCalculator.showNumber.innerHTML = 0;
      } else {
        model.clicked.count++;                                                  // increment count by 1. if currentNum not previously initialized back to zero, will update by number pressed
      }
    },
    getInfo: function(name){
      var count = model.clicked.count;
      var price = model.clicked.price;
      var total = model.clicked.total(count);
      var row = model.clicked.row;
      var bigTotal = model.bigTotal();
      viewTable.render(name,count,price,total, bigTotal, row);
    },
    pass: function(num){
      model.currentNum += num;
      if (model.pay) {
        viewCalculator.renderPayMode(model.currentNum);
      } else {
        viewCalculator.render(model.currentNum);
      }
      if (model.numA !== 0) {
        model.numB = Number(model.currentNum);
      }
    },
    passOperator: function(operator){
      model.operator.push(operator);
      if (model.numA === 0){
        model.numA = Number(model.currentNum);
      }
      if(model.numB !== 0) {
        model.calculator();
        model.numB = 0;
      }
      model.currentNum = ''
    },
    total: function(total){
      if (model.pay) {
        viewCalculator.renderPayMode(total);
      } else {
        viewCalculator.render(total);
      }
    },
    getChange: function() {
      var change = Number(model.currentNum) - model.bigTotal();
      viewCalculator.renderRefund(change);
      model.currentNum = ''; //if not reset then next command will start with this num. if payed 36$, then next will be 36 x items
    },
    reset: function(){
      model.currentNum = ''; //same than getChange
      viewTable.tbody.innerHTML = '';
      viewTable.bigTotal.innerHTML = 'Total: ' + 0;
      model.numA = 0;
      model.numB = 0;
      model.total = 0;
      viewCalculator.render(0);
      viewCalculator.renderPayMode(0);
      viewCalculator.renderRefund(0);
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
        octopus.getInfo(name);
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

      this.tbody = document.getElementsByTagName('tbody')[0];
      this.bigTotal = document.getElementById('bigTotal');
      this.bigTotal.innerHTML = 'Total: ' + 0;
      this.charge = document.getElementById('charge');
      this.reset = document.getElementById('reset');


      this.charge.addEventListener('click', function(e){
        e.preventDefault();
        viewPanel.arrow.click();
        var total = viewTable.bigTotal.innerHTML;
        viewCalculator.showNumber.innerHTML = total;
        model.currentNum = '';
        model.pay = true;
      })
      this.reset.addEventListener('click', function(){
        octopus.reset();
      })
    },
    render: function(name, count, price, total, bigTotal, row){
      var rowByName = document.getElementById(name);

      var sum = 0;

      if(rowByName){                                                            //if a row with an this name as id already exists
        var counter = rowByName.getElementsByTagName('td')[1];                  // or rowByName.firstChild.nextSibling // if rowByName doesnt exist, cant read his Tags so var cant be on top scope
        var rowTotal = counter.nextSibling;
        counter.innerHTML = count;
        rowTotal.innerHTML = total + '$';
        this.bigTotal.innerHTML = 'Total: ' + bigTotal + '$';
      } else {
        row = '<tr id="' + name + '"><td>' + name + '</td><td>' + count + '</td><td class="price">' + total + '$ </tr>';
        this.tbody.innerHTML += row;
        this.bigTotal.innerHTML = 'Total: ' + bigTotal + '$';
      }
    }
  }

  var viewCalculator = {
    init: function(){
      this.numbers = document.getElementsByClassName('number');
      this.operators = document.getElementsByClassName('operator');
      this.list = document.getElementById('calculator');
      this.showNumber = document.getElementById('showNumber');
      this.money = document.getElementById('money');
      this.pay = document.getElementById('pay');
      this.refund = document.getElementById('refund');
      this.switch = document.getElementById('switch_calculator');

      this.showNumber.innerHTML = 'Total: ' + 0 + '$';
      this.money.innerHTML =  'Pay:    ' + 0 + '$';
      this.refund.innerHTML = 'Refund: ' + 0 + '$';

      // Get the Numbers
      function getNumber(e){
        var target = e.target;
        var id = target.id;
        if(target.getAttribute('class').split(' ')[0] === 'number'){
          octopus.pass(id);
        } else if (target.getAttribute('class').split(' ')[0] === 'operator') {
          octopus.passOperator(id);
        }
      };
      this.list.addEventListener('click', getNumber);
      document.addEventListener('keydown', function(e){
        var key = e.key;
        document.getElementById(key).click();
      }, true);
      //Show the change difference
      this.pay.addEventListener('click', function(e){
        e.preventDefault();
        octopus.getChange();
      })
    },
    render: function(num){
      this.showNumber.innerHTML = 'Total: ' + num + '$';
    },
    renderPayMode: function(num) {
      this.money.innerHTML = 'Pay: ' + num + '$';
    },
    renderRefund: function(num) {
      this.refund.innerHTML = 'Refund: ' + num + '$';
    }
  }
  octopus.init();
}());
