const formatedDate = () => {
    
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
        return `${dd}/${mm}/${yyyy} ${HH}:${MM}:${SS}`.toString(); 
    }; 
    
    return format24Hour(format); 
}

const contacts = () => { 
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
    return dataContact;
}

exports.formatedDate = formatedDate;
exports.contacts = contacts;