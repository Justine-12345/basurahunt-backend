const User = require('../models/user');
const Dump = require('../models/dump');
const Item = require('../models/item');
const CollectionPoint = require('../models/collectionPoint');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');


exports.getTotalUsers = catchAsyncErrors(async (req, res, next) => {
	let usersTotal = [];

	if (req.user.role == 'administrator') {
		usersTotal = await User.countDocuments({ role: "user" })

	} else {
		usersTotal = await User.countDocuments({ role: "user", barangay: req.user.barangay })
	}

	res.status(200).json({
		success: true,
		usersTotal
	})

})


exports.getTotalDumps = catchAsyncErrors(async (req, res, next) => {
	let dumpsTotal = [];

	if (req.user.role == 'administrator') {
		dumpsTotal = await Dump.countDocuments()
	} else {
		dumpsTotal = await Dump.countDocuments({ barangay: req.user.barangay })
	}

	res.status(200).json({
		success: true,
		dumpsTotal
	})

})


exports.getTotalDonations = catchAsyncErrors(async (req, res, next) => {
	let donationsTotal = [];

	donationsTotal = await Item.countDocuments()
	res.status(200).json({
		success: true,
		donationsTotal
	})
})


exports.getCleanedDumps = catchAsyncErrors(async (req, res, next) => {
	let cleanedDumps = [];
	console.log(req.body)
	if (req.user.role == 'administrator') {
		cleanedDumps = await Dump.aggregate([
			{
				$match:
				{
					"createdAt": {
						$gte: new Date(req.body.cdStartDate),
						$lte: new Date(req.body.cdEndDate)
					},
					"status": "Cleaned"
				}
			},
			{
				$group:
				{
					_id: {
						month: { $month: "$createdAt" },
						year: { $year: "$createdAt" }
					},
					total: { $sum: 1 }
				}
			},
			{
				$sort:
				{
					"_id.year": 1,
					"_id.month": 1
				}
			}
		])
	} else {
		cleanedDumps = await Dump.aggregate([
			{
				$match:
				{
					"createdAt": {
						$gte: new Date(req.body.cdStartDate),
						$lte: new Date(req.body.cdEndDate)
					},
					"status":  { $in: ["Cleaned"] },
					"barangay": req.user.barangay
				}
			},
			{
				$group:
				{
					_id: {
						month: { $month: "$createdAt" },
						year: { $year: "$createdAt" }
					},
					total: { $sum: 1 }
				}
			},
			{
				$sort:
				{
					"_id.year": 1,
					"_id.month": 1
				}
			}
		])
	}


	res.status(200).json({
		success: true,
		cleanedDumps
	})
})




// All reported Dump Site Except NEWREPORTS
exports.getUncleanedDumps = catchAsyncErrors(async (req, res, next) => {
	let uncleanedDumps = [];
	let AllDumps = [];

	if (req.user.role == 'administrator') {
		uncleanedDumps = await Dump.aggregate([
			{
				$match:
				{
					"createdAt": {
						$gte: new Date(req.body.udStartDate),
						$lte: new Date(req.body.udEndDate)
					},
					"status": { $in: ["Confirmed", "Unfinish"] }
				}
			},
			{
				$group:
				{
					_id: {
						month: { $month: "$createdAt" },
						year: { $year: "$createdAt" }
					},
					total: { $sum: 1 }
				}
			},
			{
				$sort:
				{
					"_id.year": 1,
					"_id.month": 1
				}
			}
		])


		AllDumps = await Dump.aggregate([
			{
				$match:
				{
					"createdAt": {
						$gte: new Date(req.body.udStartDate),
						$lte: new Date(req.body.udEndDate)
					},
					"status": { $in: ["Confirmed", "Unfinish", "Cleaned"] }
				}
			},
			{
				$group:
				{
					_id: {
						month: { $month: "$createdAt" },
						year: { $year: "$createdAt" }
					},
					total: { $sum: 1 }
				}
			},
			{
				$sort:
				{
					"_id.year": 1,
					"_id.month": 1
				}
			}
		])

	} else {
		uncleanedDumps = await Dump.aggregate([
			{
				$match:
				{
					"createdAt": {
						$gte: new Date(req.body.udStartDate),
						$lte: new Date(req.body.udEndDate)
					},
					"status": { $in: ["Confirmed", "Unfinish"] },
					"barangay": req.user.barangay
				}
			},
			{
				$group:
				{
					_id: {
						month: { $month: "$createdAt" },
						year: { $year: "$createdAt" }
					},
					total: { $sum: 1 }
				}
			},
			{
				$sort:
				{
					"_id.year": 1,
					"_id.month": 1
				}
			}
		])

		AllDumps = await Dump.aggregate([
			{
				$match:
				{
					"createdAt": {
						$gte: new Date(req.body.udStartDate),
						$lte: new Date(req.body.udEndDate)
					},
					"status": { $in: ["Confirmed", "Unfinish", "Cleaned"] },
					"barangay": req.user.barangay
				}
			},
			{
				$group:
				{
					_id: {
						month: { $month: "$createdAt" },
						year: { $year: "$createdAt" }
					},
					total: { $sum: 1 }
				}
			},
			{
				$sort:
				{
					"_id.year": 1,
					"_id.month": 1
				}
			}
		])

	}


	res.status(200).json({
		success: true,
		uncleanedDumps,
		AllDumps
	})
})


exports.getDonatedItems = catchAsyncErrors(async (req, res, next) => {
	let donatedItems = [];

	let cluster
	if (req.body.cluster) {
		cluster = req.body.cluster
	}

	if (cluster) {
		donatedItems = await Item.aggregate([
			{
				$match:
				{
					"date_recieved": {
						$gte: new Date(req.body.diStartDate),
						$lte: new Date(req.body.diEndDate)
					},
					"status": "Received"
				}
			},
			{
				$group:
				{
					_id: cluster,
					total: { $sum: 1 }
				}
			},
			{
				$sort:
				{
					total: -1,
					_id: 1
				}
			}
		])
	} else {
		donatedItems = await Item.aggregate([
			{
				$match:
				{
					"date_recieved": {
						$gte: new Date(req.body.diStartDate),
						$lte: new Date(req.body.diEndDate)
					},
					"status": "Received"
				}
			},
			{
				$group:
				{
					_id: {
						month: { $month: "$date_recieved" },
						year: { $year: "$date_recieved" }
					},
					total: { $sum: 1 }
				}
			},
			{
				$sort:
				{
					"_id.year": 1,
					"_id.month": 1
				}
			}
		])
	}


	res.status(200).json({
		success: true,
		donatedItems
	})

})







exports.getCollectionPerTruck = catchAsyncErrors(async (req, res, next) => {
	let collectionPerTruck = [];

	let cluster
	if (req.body.cluster) {
		cluster = req.body.cluster
	}

	if (cluster) {
		collectionPerTruck = await CollectionPoint.aggregate([
			{
				$match:
				{
					"createdAt": {
						$gte: new Date(req.body.cptStartDate),
						$lte: new Date(req.body.cptEndDate)
					}
				}
			},
			{
				$addFields:
				{
					"totalTruck": {
						$sum: '$collectionPerTruck.numOfTruck',

					}
				}
			},
			{
				$group:
				{
					_id: cluster,
					total: { $sum: '$totalTruck' }
				}
			},

			{
				$sort:
				{
					total: -1,
					_id: 1
				}
			}
		])

	} else {

		collectionPerTruck = await CollectionPoint.aggregate([
			{
				$match:
				{
					"createdAt": {
						$gte: new Date(req.body.cptStartDate),
						$lte: new Date(req.body.cptEndDate)
					}
				}
			},
			{
				$addFields:
				{
					"totalTruck": {
						$sum: '$collectionPerTruck.numOfTruck',

					}
				}
			},
			{
				$group:
				{
					_id: {
						month: { $month: "$createdAt" },
						year: { $year: "$createdAt" },
					},
					total: { $sum: '$totalTruck' }
				}
			},

			{
				$sort:
				{
					"_id.year": 1,
					"_id.month": 1
				}
			}
		])
	}

	res.status(200).json({
		success: true,
		collectionPerTruck
	})
})



exports.getCollectionPoints = catchAsyncErrors(async (req, res, next) => {
	let collectionPoint = [];

	let cluster
	if (req.body.cluster) {
		cluster = req.body.cluster
	}

	if (cluster) {
		collectionPoint = await CollectionPoint.aggregate([
			{
				$match:
				{
					"createdAt": {
						$gte: new Date(req.body.cpStartDate),
						$lte: new Date(req.body.cpEndDate)
					},
				}
			},
			{
				$group:
				{
					_id: cluster,
					total: { $sum: 1 }
				}
			},
			{
				$sort:
				{
					total: -1,
					_id: 1
				}
			}
		])

	} else {
		collectionPoint = await CollectionPoint.aggregate([
			{
				$match:
				{
					"createdAt": {
						$gte: new Date(req.body.cpStartDate),
						$lte: new Date(req.body.cpEndDate)
					},
				}
			},
			{
				$group:
				{
					_id: {
						month: { $month: "$createdAt" },
						year: { $year: "$createdAt" }
					},
					total: { $sum: 1 }
				}
			},
			{
				$sort:
				{
					"_id.year": 1,
					"_id.month": 1
				}
			}
		])
	}

	res.status(200).json({
		success: true,
		collectionPoint
	})
})




exports.getReportsPerCategory = catchAsyncErrors(async (req, res, next) => {
	let reportsPerCategory = [];

	reportsPerCategory = await Dump.aggregate([
		{
			$unwind: "$waste_type"
		},
		{
			$match:
			{
				"createdAt": {
					$gte: new Date(req.body.rcStartDate),
					$lte: new Date(req.body.rcEndDate)
				},
			}
		},
		{
			$group:
			{
				_id: {
					waste_type: "$waste_type.type",
					year: { $year: "$createdAt" }
				},
				total: { $sum: 1 }
			}
		},
		{
			$sort:
			{
				"_id": 1
			}
		}
	])


	res.status(200).json({
		success: true,
		reportsPerCategory
	})
})


exports.getDonationsPerCategory = catchAsyncErrors(async (req, res, next) => {
	let donationsPerCategory = [];

	donationsPerCategory = await Item.aggregate([
		{
			$unwind: "$item_type"
		},
		{
			$match:
			{
				"createdAt": {
					$gte: new Date(req.body.dcStartDate),
					$lte: new Date(req.body.dcEndDate)
				},
			}
		},
		{
			$group:
			{
				_id: {
					item_type: "$item_type.type",
					year: { $year: "$createdAt" }
				},
				total: { $sum: 1 }
			}
		},
		{
			$sort:
			{
				"_id": 1
			}
		}
	])


	res.status(200).json({
		success: true,
		donationsPerCategory
	})
})



