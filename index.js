const cron = require("node-cron");
const express = require("express");
const starkbank = require('starkbank');
const sleep = require('thread-sleep');
const fs = require('fs'); 
const config = require('config');
const { formatedDate, contacts } = require('./utils/utils');

app = express();
// number of executions for period
const countLimitExecute = parseInt(config.get('numberLimitExec'));

let transferList = [];
let transferFailedList = [];
let average = 0;
let countExec = 0;

// for project users:
let user = new starkbank.Project({
    environment: config.get('environment'),
    id: config.get('projectId'),
    privateKey: config.get('privateKey')
});

starkbank.user = user;

// Schedule cron job
//var task = cron.schedule("0 * */3 * * *", transferJob, {scheduled: false});
var task = cron.schedule("0 */3 * * * *", transferJob, {scheduled: false});
task.start();

// Define total time execution
setTimeout(() => {
    task.stop();
}, 90000000);

app.listen(1313);

console.log('\n'+ formatedDate()+' - Executando TRANSFERS-STARK-CRON...');

async function transferJob(){       
    console.log(''+formatedDate()+ ' ########## BEGIN - Executando');
    
    countExec++;
    let transfers = [];
    let myarray = getContacts();
    try {
        // Create transfers
        transfers = await starkbank.transfer.create(myarray);

        let logs = '';
        for (let transfer of transfers) {
            
            let transferId = transfer.id;
            let transferStatus = transfer.status;
            logs = logs.concat('', transferId + ' - ' + transfer.externalId + ' - ' + transfer.amount 
                + ' - ' + transfer.taxId + '\n');
                  
            
            while(transferStatus == 'processing' || transferStatus == 'created'){
                // waiting time for logs consult
                sleep(10000);
                // Get transfer for know changed status 
                let transferAux = await starkbank.transfer.get(transferId);
                transferStatus = transferAux.status;
                console.log('Transfer log - '+ transfer.id + ' status == '+ transferStatus);
                if(transferStatus == 'success' || transferStatus == 'failed') {

                    const createdDate = new Date(transferAux.created);
                    const updatedDate = new Date(transferAux.updated);
                    // Calculating time for changed status
                    let timelog =  updatedDate.getTime() - createdDate.getTime();
                    console.log('created= '+ transferAux.created + ' updated =' + transferAux.updated 
                        + ' >>>>> difference_ms = '+ timelog);
                    transferList.push([transferAux, timelog]);

                    if(transferStatus == 'failed'){
                        console.log('... Recuperando log falha');
                        // Get log failed
                        let logFailed = await starkbank.transfer.log.query({
                            types: 'failed',
                            transferIds: transferId,
                        });

                        for await (let log of logFailed) {
                            transferFailedList.push(log.errors[0])
                            console.log('>>>>>>> logFailed: '+ log.errors[0]);
                        }
                    }
                }
                    
            }
        }
        console.log('\n===== CREATED TRANSFERS ======\n'+ logs);

    } catch (err) {
        console.log("************************** " + err.message);
    }

    console.log(''+ formatedDate() + ' ##########   END - Executando');

    if(countExec >= countLimitExecute) {
        getReport();
        return;
    }
    return;
}

function randomAmount() {  
    return Math.floor(
        Math.random() * (10000 - 1000) + 1000
    )
}

function getUuid(){
    sleep(1000);
    return Math.floor(Date.now());
}

function getPerSucess() {
    let countSucess = 0;
    let totalTimeUpdate = 0;
    for (let index = 0; index < transferList.length; index++) {
        const item = transferList[index][0];
        totalTimeUpdate += transferList[index][1];
        if(item.status == 'success') {
            countSucess++;
        }
    }
    average = ((totalTimeUpdate/transferList.length)/1000).toFixed(2);
    
    return ((countSucess/transferList.length).toFixed(2))*100;
}

function getContacts(){
    let dataContact = contacts();
    let contactArray = [];
    for (let index = 0; index < dataContact.length; index++) {
        const dataItem = dataContact[index];
        let contact = new starkbank.Transfer({
            amount: randomAmount(),
            bankCode: dataItem[0],
            branchCode: dataItem[1],
            accountNumber: dataItem[2],
            taxId: dataItem[3],
            name: dataItem[4],
            externalId: 'uuid_test_' + getUuid(),
            description: 'Payment for test engineer',
            tags: ['pay-request-api-test'],
            rules: [
                {
                    key: 'resendingLimit',
                    value: 5
                }
            ]
        });
        contactArray.push(contact);

    }
    return contactArray;
}

function getReport(){
    let result = '\n------------------ RELATORIO EXECUCAO - ' + formatedDate() +' ----------------------- '+
        '\n*** Total de Transferencias Pix criadas : '+ transferList.length +
        '\n*** Porcentagem das Transferencias Pix com sucesso: '+ getPerSucess() +'%'+
        '\n*** Total de Transferencias Pix com Falha: '+ transferFailedList.length +
        '\n*** Erros encontrados nas transferências com falha: ' + Array.from(new Set(transferFailedList)) +
        '\n*** Tempo medio de criacao dos logs (sucesso ou falha) em segundos: '+ average +
        '\n-----------------------------------------------------------------------';
    task.stop();
    
    const data = "This is the new content of the file."; 
    fs.writeFile('result.txt', result, (err) => { 
        if(err) { 
            throw err; 
            console.log("Data has been written to file successfully."); 
        }
    });
    console.log(result);
    console.log('>>>>>>> RELATORIO EXECUCAO esta disponivel no arquivo result.txt')
}


    