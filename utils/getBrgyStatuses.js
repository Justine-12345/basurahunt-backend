const Dump = require('../models/dump')
const barangayStatuses = async (startDate, endDate, barangay) => {
    let barangayStatusesObj = {
        clusterName:barangay,
        statuses:{}
    }
    cleanDumps = await Dump.find(
        {
            "createdAt": {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            },
            "status": "Cleaned",
            "barangay": barangay
        }

    ).countDocuments()

    unCleanDumps = await Dump.find(
        {
            "createdAt": {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            },
            "status":{$in:["Confirmed","Unfinish"]},
            "barangay": barangay
        }

    ).countDocuments()
    
    barangayStatusesObj.statuses = {cleanDumps, unCleanDumps}
        
    return barangayStatusesObj

}

module.exports = barangayStatuses