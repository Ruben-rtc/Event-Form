import { Router } from "express";

const formRouter = Router();

formRouter.get('', async(req, res) => {
    try {
        res.json({})
    } catch {
        res.status(500).json({message: "Une erreur interne est survenue"})
    }
})


export default formRouter