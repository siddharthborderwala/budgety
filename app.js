//BUDGET CONTROLLER
var budgetController = (function() {

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1,
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // ID = last ID + 1;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new item based on 'inc' or 'exp' type
            if (type === 'inc') {
                newItem = new Income(ID, des, val);
            } else if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);

            //Return newItem
            return newItem;
        },
        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        testing: function() {
            return data;
        },
        calculateBudget: function() {

            calculateTotal('inc');
            calculateTotal('exp');

            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },
        calculatePercentage: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(cur) {
                return cur.percentage;
            });
            return allPercentages;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
            };
        }
    }

})();



//UI CONTROLLER
var UIController = (function() {

    document.querySelector('.budget__title--month').textContent = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    //some code
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        expensesPercentageLabel: '.item__percentage'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];
        return (type === 'inc' ? '+ ' : '- ') + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; ++i) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
            };
        },
        getDOMStrings: function() {
            return DOMStrings;
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;

            //Create html strings with queryselector
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%">\
                <div class="item__description">%description%</div>\
                <div class="right clearfix"><div class="item__value">\
                %value%</div><div class="item__delete">\
                <button class="item__delete--btn"><i class="ion-ios-close-outline">\
                </i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%">\
                <div class="item__description">%description%</div>\
                <div class="right clearfix"><div class="item__value">\
                %value%</div><div class="item__percentage">21%</div>\
                <div class="item__delete"><button class="item__delete--btn">\
                <i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replaceplaceholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },
        displayBudget: function(obj) {
            var type = obj.budget > 0 ? 'inc' : 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

            nodeListForEach(fields, function(curr, index) {
                curr.textContent = percentages[index] > 0 ? percentages[index] + '%' : '---';
            });
        },
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector('.add__btn').classList.toggle('red');
        },
        deleteItem: function(selectorID) {
            document.getElementById(selectorID).remove();
        }

    };

})();



//GLOBAL CONTROLLER
var controller = (function(bgtCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOMStrings = UICtrl.getDOMStrings();

        document.querySelector(DOMStrings.inputBtn).addEventListener('click', ctrlAdd);

        document.addEventListener('keypress', function(keyEvent) {
            if (keyEvent.key === 'Enter' || keyEvent.which === 13 || keyEvent.keyCode === 13) {
                ctrlAdd();
            }
        });

        document.querySelector('.container').addEventListener('click', ctrlDeleteItem);

        document.querySelector('.add__type').addEventListener('change', UICtrl.changedType);
    };

    var updateBgt = function() {
        // 1. Calculate the buget
        bgtCtrl.calculateBudget();
        // 2. Return the budget
        var budget = bgtCtrl.getBudget();
        // 5. Display the budget on ui
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {

        // 1. Read percentage from BgtCtrl after its calculation
        bgtCtrl.calculatePercentage();
        var percentages = bgtCtrl.getPercentages();
        // 2. Updating the UI
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAdd = function() {
        var inp, newItem;

        // 1. Get the field input
        inp = UICtrl.getInput();

        if (inp.value > 0 && inp.description !== "" && !isNaN(inp.value)) {
            // 2. Add the item to budget controller
            newItem = bgtCtrl.addItem(inp.type, inp.description, inp.value);
            // 3. Add the item to ui
            UICtrl.addListItem(newItem, inp.type);
            // 3.1 Clear the fields
            UICtrl.clearFields();
            // 4. Calculate budget
            updateBgt();
            // 5. Update percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete item from data structure
            bgtCtrl.deleteItem(type, ID);
            //  2. Delete item from UI
            UICtrl.deleteItem(itemID);
            // 3. Update and display new budget
            updateBgt();
            // 5. Update percentages
            updatePercentages();
        }

    };

    return {
        init: function() {
            console.log('Application Started');
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0,
            });
            setupEventListeners();
        },
    }

})(budgetController, UIController);

controller.init();