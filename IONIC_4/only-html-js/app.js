const inputReason = document.querySelector('#input-reason');
const inputAmount = document.querySelector('#input-amount');
const btnConfirm  = document.querySelector('#btn-confirm');
const btnCancel   = document.querySelector('#btn-cancel');
const expenseList = document.querySelector('#expense-list');
const totalExpencesOutout = document.querySelector('#total-expenses');
const alertCtrl               = document.querySelector('ion-alert-controller');
let totalExpenses = 0;
const clear = () =>{
    inputAmount.value = '';
    inputReason.value = '';

}

btnConfirm.addEventListener('click',() =>{
   
    const enteredInputReason = inputReason.value;
    const enteredInputAmount = inputAmount.value;

    if(enteredInputReason.trim().length <= 0 || 
       enteredInputAmount <= 0 || 
       enteredInputAmount.trim().length <= 0
       ){
        alertCtrl.create({
               header:'Invalid Inputs',
               message:'Please provide valid reason and amount',
               buttons:['Okay']
           }).then(alertElement =>{
               alertElement.present();
           });
            return;
       }

    
    const newItem = document.createElement('ion-item');
    newItem.textContent = enteredInputReason  +':$' + enteredInputAmount;
    expenseList.appendChild(newItem);

    clear();

    totalExpenses += +enteredInputAmount;

    totalExpencesOutout.textContent = totalExpenses;
});


btnCancel.addEventListener('click', clear);