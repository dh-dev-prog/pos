(function(){
  // CALCULATOR
  var model = {
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
  };

  var octopus = {
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
  }

  var viewCalculator = {
    init: function(){
      this.numbers    = document.getElementsByClassName('number');
      this.operators  = document.getElementsByClassName('operator');
      this.list       = document.getElementById('calculator');
      this.showNumber = document.getElementById('showNumber');
      this.money      = document.getElementById('money');
      this.pay        = document.getElementById('pay');
      this.refund     = document.getElementById('refund');
      this.switch     = document.getElementById('switch_calculator');

      this.showNumber.innerHTML = 'Total:  ' + 0 + '$';
      this.money.innerHTML      = 'Pay:    ' + 0 + '$';
      this.refund.innerHTML     = 'Refund: ' + 0 + '$';

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
