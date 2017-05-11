(function(){
  var model = {
    clicked: null,
    drinkList:[],
    Drink: function(name,price){
      this.name = name;
      this.price = price;
      this.count = 0;
      this.total = function(count){
        return count * this.price;
      }
      model.drinkList.push(this);
    }
  };
  var octopus = {
    init: function(){
      viewPanel.init();
      viewSum.init();
      this.add();
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
      model.clicked.count++;
    },
    getInfo: function(name){
      var count = model.clicked.count;
      var price = model.clicked.price;
      var total = model.clicked.total(count);
      viewSum.render(name,count,price,total);
    }
  };
  var viewPanel = {
    init: function(){
      var list = document.getElementById('list');
      list.addEventListener('click', function(e){
        e.preventDefault();
        var target = e.target;
        var name = target.textContent;
        octopus.updateCurrObj(name);
        octopus.getInfo(name);
      })
    }
  };
  var viewSum = {
    init: function(){
      this.tbody = document.getElementsByTagName('tbody')[0];
      this.bigTotal = document.getElementById('bigTotal');
      this.bigTotal.innerHTML = 'Total: ' + 0;
    },
    render: function(name, count, price, total){
      var rowByName = document.getElementById(name);
      var row;
      var sum = 0;

      if(rowByName){ //if a row with an this name as id already exists
        var counter = rowByName.getElementsByTagName('td')[1]; // or rowByName.firstChild.nextSibling // if rowByName doesnt exist, cant read his Tags so var cant be on top scope
        var rowTotal = counter.nextSibling;
        counter.innerHTML = count;
        rowTotal.innerHTML = total + '$';
        sumPrice();
      } else {
        row = '<tr id="' + name + '"><td>' + name + '</td><td>' + count + '</td><td class="price">' + total + '$ </tr>';
        this.tbody.innerHTML += row;
        sumPrice();
      }

      function sumPrice(){
        var lastCol = viewSum.tbody.getElementsByClassName('price');
        Array.prototype.forEach.call(lastCol, function(el){
          var elTotal = el.innerHTML.replace('$',''); //get the last column of each row wich hold the price and delete $
          sum += Number(elTotal);
        })
        this.bigTotal.innerHTML = 'Total: ' + sum + '$';
      }
    }
  }
  octopus.init();
}());

(function(){
  var model = {
    currentNum: '',
    id: [],
    numA: 0,
    numB: 0,
    total: 0,
    operators: {
      '+': function(a, b) { return a + b },
      '-': function(a, b) { return a - b },
      '*': function(a, b) { return a * b },
      '/': function(a, b) { return a / b },
    },
    calculator: function(id){
      this.total = this.operators[this.id[this.id.length -2]](this.numA, this.numB);
      this.numA = this.total;
      octopus.total(this.total);
    }
  };

  var octopus = {
    init: function(){
      view.init();
    },
    pass: function(id){
      model.currentNum += id
      view.render(model.currentNum);
    },
    passB: function(id){
      model.id.push(id);
      view.render(id);
      if (model.numA === 0){
        model.numA = Number(model.currentNum);
        model.currentNum = '';
      } else {
        model.numB = Number(model.currentNum);
        model.currentNum = '';
        model.calculator(id);
      }
    },
    total: function(total){
      view.render(total);
    }
  };

  var view = {
    init: function(){
      this.numbers = document.getElementsByClassName('number');
      this.operators = document.getElementsByClassName('operator');
      this.list = document.getElementById('calculator');
      this.showNumber = document.getElementById('showNumber');

      function getNumber(e){
        var target = e.target;
        var id = target.id;
        if(target.getAttribute('class') === 'number'){
          octopus.pass(id);
        } else if (target.getAttribute('class') === 'operator') {
          octopus.passB(id);
        }
      }

      this.list.addEventListener('click', getNumber);
      document.addEventListener('keydown', function(e){
        var key = e.key;
        document.getElementById(key).click();
      }, true);
    },
    render: function(name){
      this.showNumber.innerHTML = name;
    }
  }
  octopus.init();
}());
