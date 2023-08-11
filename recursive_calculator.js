const memoriesState = globalState() 
const lastCalculatedValue = globalState()

function globalState() {
    const stateObject = {}
    let calculatedValue

    return {
        setProperty: (memoryName, input=0) => {
            stateObject[memoryName] = input;  
        },
        getProperty: (memoryName) => stateObject[memoryName],
        getState: () => stateObject,
        getEntries: () => Object.entries(stateObject),
        hasProperty: (memoryName) => stateObject.hasOwnProperty(memoryName) ? true : false,
        setVariable: (input) => {
            calculatedValue = input
        },
        getVariable: () => calculatedValue,
    }
}


function extractCommand(input) {
    
    const spaceIndex = input.indexOf(" ");

    if (spaceIndex !== -1) {
        const commandInput = input.slice(0, spaceIndex);
        const memoryInput = input.slice(spaceIndex+1)
        return [commandInput, memoryInput]
    } 
    else {
        return input
    }
}


function secondOperandLength(input, sum1=0, sum2=0) {
 
    if (sum1 === sum2 && sum1 !== 0) {
        return input.length
    }

    const indexOpen = input.indexOf("(");
    const indexClose = input.indexOf(")");
    
    if (indexClose === -1 || indexOpen === -1) {
        return false;
    } else if (indexOpen < indexClose) {
        return secondOperandLength(input.slice(indexOpen+1), sum1+1, sum2);
    } else if (indexClose < indexOpen) {
        return secondOperandLength(input.slice(indexClose+1), sum1, sum2+1);
    }

    return false
}

function separateOperands(input) {
    const middleIndex = input.length-secondOperandLength(input);

    if(!middleIndex) {
        return false
    }

    const firstOperand = input.slice(0, middleIndex);
    const secondOperand = input.slice(middleIndex+1)

    return [firstOperand, secondOperand]
}


function removeParenteses(operand) {

    if (operand[0] === "(" && operand[operand.length-1] === ")") {
        return operand.slice(1, -1)
    } else {
        return false
    }
}


function separateExpression(expression) {

    if(!expression) {
        return false
    }

    let firstSpaceIndex = expression.indexOf(" ")
    let operator = expression.slice(0, firstSpaceIndex+1);
    let operands = expression.slice(firstSpaceIndex+1);

    return [operator, operands]
}


function getCalculation(input) {
    
    if (testFalsyNotZero(input)) {
        return false
    }

    if (parseFloat(input) || memoriesState.hasProperty(input)) { 
        return parseFloat(input) || memoriesState.getProperty(input); 
    } 

    const splitExpression = separateExpression(input);
    const operator = splitExpression[0]
    const operands = splitExpression[1]

    const splitOperands = separateOperands(operands);
    const firstOperand = splitOperands[0]
    const secondOperand = splitOperands[1]

    const returnedFirstOperand = getCalculation(removeParenteses(firstOperand));

    if (testFalsyNotZero(returnedFirstOperand)) {
        return false
    }

    let returnedSecondOperand

    if (secondOperand.length > 0) {
        returnedSecondOperand = getCalculation(removeParenteses(secondOperand));
        
        if (testFalsyNotZero(returnedSecondOperand)) {
            return false
        }
    }

    return calculateExpressions(operator, returnedFirstOperand, returnedSecondOperand)
}


function testFalsyNotZero(input) {
    return !input && input !== 0 ? true : false
}

function calculateExpressions(operator, operand1, operand2) {
  
    let result
    switch (operator.toLowerCase()) {
        case "abs ":
            result = Math.abs(operand1);
            break;
        case "sin ":
            result = Math.sin(operand1);
            break;
        case "cos ":
            result = Math.cos(operand1);
            break;
        case "exp ":
            result = Math.exp(operand1);
            break;
        case "log ":
            result = Math.log(operand1);
            break;
        case "round ":
            result = Math.round(operand1);
            break;
        case "ceil ":
            result = Math.ceil(operand1);
            break;
        case "floor ":
            result = Math.floor(operand1);
            break;
        case "+ ":
            result = operand1+operand2;
            break;
        case "- ":
            result = operand1-operand2;
            break;
        case "* ":
            result = operand1*operand2;
            break;
        case "/ ":
            result = operand1/operand2;
            break;
        default: 
            return false;
    }

    return result
}  


function roundNumber(number) {
    if (Number.isInteger(number)) {
        return number
    } else {
        const roundNumber = roundTwoDecimalPlaces(number); 
        return +roundNumber
    }
}

function roundTwoDecimalPlaces(float) {
    return float.toFixed(2);
}

function displayMemories(list, outputArray=[]) {
    const currentMemory = `${list[0][0]}: ${roundTwoDecimalPlaces(list[0][1])}`
    outputArray.push(currentMemory)
    return list.length === 1 ? outputArray : displayMemories(list.slice(1), outputArray)
}

//UI---------------------------------------------------------------------------------------------------------------

const VMcommand = "VM - Consultar o valor da memória";
const LMcommand = "LM - Indicar o nome das memórias";
const CEcommand = "CE - Calcular o valor de uma expressão";
const AVMcommand = "AVM - Atribuir último valor calculado a uma memória";
const Acommand = "A - Ajuda";
const AMcommand = "AM - Alocar memória";
const Scommand = "S - Sair";
const menuCommandsAlert = VMcommand+"\n"+LMcommand+"\n"+CEcommand+"\n"+AVMcommand+"\n"+Acommand+"\n"+AMcommand+"\n"+Scommand;

//ALERTS
const menuDefaultOptionAlert = "Opção inexistente."
const menuExitAlert = "Aplicacao terminada. Ate a proxima."
const invalidMemoryAlert = "Memoria nao existente." 
const createdMemoryAlert = "memoria criada com o nome:"
const memoryAlreadyExistsAlert = "Ja existe uma memoria com esse nome"
const invalidExpressionAlert = "Expressao mal definida."
const noMemoriesAlert = "Calculadora sem memorias."

function menu() {
    let userInput = prompt(menuCommandsAlert);

    let validInput = extractCommand(userInput);
    let inputCommand
    let inputExpression

    if (typeof validInput === "string") {
        inputCommand = validInput;       
    } else {
        inputCommand = validInput[0];
        inputExpression = validInput[1];
    }
    
    switch (inputCommand.toUpperCase()){
        case "VM":
            if (globalStateHasProperty(memoriesState, inputExpression)) {
                const requestedMemory = getPropertyFromGlobalState(memoriesState, inputExpression);
                alert(`${inputExpression}: ${roundTwoDecimalPlaces(requestedMemory)}`);    
            } 
            else {
                alert(invalidMemoryAlert);    
            }
            break;
        case "LM":
            const entriesList = memoriesState.getEntries() 
            if (entriesList.length > 0) {
                const memoriesList = displayMemories(entriesList)
                alert(memoriesList.join("; "));
            } else {
                alert(noMemoriesAlert)
            } 
            break;
        case "CE":
            const calculatedValue = getCalculation(inputExpression)
            testFalsyNotZero(calculatedValue) ? alert(invalidExpressionAlert) : alert(roundNumber(calculatedValue))
            lastCalculatedValue.setVariable(calculatedValue);
            break;
        case "AVM":
            if (memoriesState.hasProperty(inputExpression)) {
                const requestedCalculatedValue = lastCalculatedValue.getVariable();
                memoriesState.setProperty(inputExpression, requestedCalculatedValue);
                const updatedMemoryValue = memoriesState.getProperty(inputExpression);
                alert(`${inputExpression}: ${roundTwoDecimalPlaces(updatedMemoryValue)}`)
            } else {
                alert(invalidMemoryAlert);
            }
            break;
        case "A":
            alert(menuCommandsAlert);
            break;
        case "AM":
            if (memoriesState.hasProperty(inputExpression)) {
                alert(memoryAlreadyExistsAlert)
            } else {
                memoriesState.setProperty(inputExpression);
                alert(`${createdMemoryAlert} ${inputExpression}`);
            }
            break;
        case "S":
            return alert(menuExitAlert);
        default:
            alert(menuDefaultOptionAlert);
    }
    menu();
}


menu()
