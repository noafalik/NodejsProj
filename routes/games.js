const express = require("express");
const { auth } = require("../middlewares/auth");
const { GameModel, validateJoi } = require("../models/gameModel");
const router = express.Router();

router.get("/", async (req, res) => {
    let page = req.query.page - 1 || 0;
    let perPage = req.query.perPage || 10;
    let sort = req.query.sort || "price";
    let reverse = (req.query.reverse == "yes") ? 1 : -1;

    try {
        let data = await GameModel.find({})
            .limit(perPage)
            .skip(page * perPage)
            .sort({ [sort]: reverse })
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.get("/search", async (req, res) => {
    let perPage = 10;
    try {
        let search = req.query.s;
        let searchExp = new RegExp(search, "i")
        let page = req.query.page - 1 || 0;
        let data = await GameModel.find({ $or: [{ name: searchExp }, { info: searchExp }] })
            .limit(perPage)
            .skip(page * perPage);
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.get("/category/:catname", async (req, res) => {
    let perPage = 10;
    try {
        let catname = req.params.catname;
        let page = req.query.page - 1 || 0;
        let searchExp = new RegExp(catname, "i")
        let data = await GameModel.find({ category: searchExp })
            .limit(perPage)
            .skip(page * perPage);
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.post("/", auth, async (req, res) => {
    let validBody = validateJoi(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let game = new GameModel(req.body);

        game.user_id = req.tokenData._id;
        await game.save();
        res.status(201).json(game)
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.put("/:editId", auth, async (req, res) => {
    let validBody = validateJoi(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let editId = req.params.editId;
        let data;
        if(req.tokenData.role == "admin"){
            data = await GameModel.updateOne({ _id: editId}, req.body);
        }
        else{
            data = await GameModel.updateOne({ _id: editId, user_id: req.tokenData._id }, req.body);
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.delete("/:dellId", auth, async (req, res) => {
    try {
        let dellId = req.params.dellId;
        let data;
        if(req.tokenData.role == "admin"){
            data = await GameModel.deleteOne({ _id: dellId});
        }
        else{
            data = await GameModel.deleteOne({ _id: dellId, user_id: req.tokenData._id });
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.get("/prices", async (req, res) => {
    let perPage = 10;
    let page = req.query.page - 1 || 0;
    let min = req.query.min || 0;
    let max = req.query.max || 150;
    try {
        let data = await GameModel.find({ price: { $gte: min, $lte: max } })
            .limit(perPage)
            .skip(page * perPage);
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.get("/single/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let data = await GameModel.find({ _id : id})
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

module.exports = router;