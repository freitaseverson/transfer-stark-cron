const cron = require("node-cron");
const express = require("express");
const starkbank = require('starkbank');
const sleep = require('thread-sleep');
const fs = require('fs'); 

app = express();
// number of executions for period
const countLimitExecute = 8;
let transferList = [];
let transferFailedList = [];
let average = 0;
let countExec = 0;

let privateKeyContent = `
-----BEGIN EC PARAMETERS-----
BgUrgQQACg==
-----END EC PARAMETERS-----
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEINDJKqPsgNyIjfqlbkrHtBFl7EJGX0oHKqQawzIO3y4FoAcGBSuBBAAK
oUQDQgAEXSIezYEkc6XOdcFwADIFyENTvbsEx8y7eYcPRqGayt7ZWsfCKqVR74GM
ngKRXv6PGMfDRs25FqKBjgVR5pEx4Q==
-----END EC PRIVATE KEY-----
`

// for project users:
let user = new starkbank.Project({
    environment: 'sandbox',
    id: '6236122648674304',
    privateKey: privateKeyContent
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

async function transferJob(){       
    console.log('##### BEGIN - Executando | Current Time: '+ getFormatedDate());
    
    countExec++;
    let transfers = [];
    //let myarray = [];
    let myarray = getContacts();
    try {
        // Create transfers
        transfers = await starkbank.transfer.create(myarray);

        let logs = '';
        for (let transfer of transfers) {
            
            let transferId = transfer.id;
            let transferStatus = transfer.status;
            //transfer.log

            logs = logs.concat('', transferId + ' - ' + transfer.externalId + ' - ' + transfer.amount 
                + ' - ' + transfer.taxId + '\n');
                  
            
            while(transferStatus == 'processing' || transferStatus == 'created'){
                // waiting time for logs consult
                sleep(10000);
                console.log('\n Transfer log - '+ transfer.id);
                // Get transfer for know changed status 
                let transferAux = await starkbank.transfer.get(transferId);
                transferStatus = transferAux.status;
                console.log('transferStatus == '+ transferStatus);
                if(transferStatus == 'success' || transferStatus == 'failed') {

                    console.log('created= '+ transferAux.created + ' updated =' + transferAux.updated);
                    const createdDate = new Date(transferAux.created);
                    const updatedDate = new Date(transferAux.updated);
                    // Calculating time for changed status
                    let timelog =  updatedDate.getTime() - createdDate.getTime();
                    console.log('difference_ms = '+ timelog);
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

    console.log('#####    END - Executando | Current Time: '+ getFormatedDate());

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

function getFormatedDate(){
    
    const date = new Date(); 

    const formatData = (input) => { 
    if (input > 9) { 
        return input; 
    } else return `0${input}`; 
    };

    // Function to convert 
    // 24 Hour to 12 Hour clock 
    const formatHour = (input) => { 
    if (input > 12) { 
        return input - 12; 
    } 
    return input; 
    }; 

    // Data about date 
    const format = { 
        dd: formatData(date.getDate()), 
        mm: formatData(date.getMonth() + 1), 
        yyyy: date.getFullYear(), 
        HH: formatData(date.getHours()), 
        hh: formatData(formatHour(date.getHours())), 
        MM: formatData(date.getMinutes()), 
        SS: formatData(date.getSeconds()), 
    }; 

    const format24Hour = ({ dd, mm, yyyy, HH, MM, SS }) => { 
        return `${dd}/${mm}/${yyyy} ${HH}:${MM}:${SS}`; 
    }; 
    
    return format24Hour(format); 
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
    let dataContact = [
        ['00694389', '2461', '3314317866267628', '27.902.211/0001-76', 'FPM Group'],
        ['24610065', '4320', '240636898352767', '272.696.270-02', 'Daina Rehmert'],
        ['31880826', '1296', '7649414384171378', '54.222.994/0001-10', 'PYDA Group'],
        ['04406371', '9101', '1633061087450179', '42.654.984/0001-74', 'RAVVV Group'],
        ['08071414', '7009', '9421940089544799', '19.727.132/0001-48', 'Telma Spargo'],
        ['03102185', '8650', '8566071965644841', '61.688.499/0001-66', 'INZ S.A.'],
        ['17192451', '5734', '4607188913089125', '55.330.936/0001-72', 'DRJ S.A.'],
        ['04138455', '2337', '7777525330771462', '20.792.828/0001-37', 'Meggan Eireli'],
        ['17343510', '5548', '4144640162680751', '58.766.050/0001-64', 'MGABQ Ltda.'],
        ['02197569', '9689', '8944178065480508', '707.534.580-04', 'Jackie Accurso']
    ]
    
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
    let result = '\n------------------ RELATORIO EXECUCAO - ' + getFormatedDate() +' ----------------------- '+
        '\n*** Total de Transferencias Pix criadas : '+ transferList.length +
        '\n*** Porcentagem das Transferencias Pix com sucesso: '+ getPerSucess() +'%'+
        '\n*** Total de Transferencias Pix com Falha: '+ transferFailedList.length +
        '\n*** Erros encontrados nas transferências com falha: ' + Array.from(new Set(transferFailedList)) +
        '\n*** Tempo medio de criacao do logs (sucesso ou falha) em segundos: '+ average +
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


    