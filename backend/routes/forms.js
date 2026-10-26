import { Router } from "express";
import db from "../db/db-forms.js";

const formRouter = Router();

formRouter.get('', async(req, res) => {
    try {
        const forms = await db.getAllForms()
        return res.json({forms})
    } catch {
        res.status(500).json({message: "Une erreur interne est survenue"})
    }
})

formRouter.get('/:id', async(req, res) => {
    try {
        const id = parseInt(req.params.id)
        const form = await db.getFormById(id)

        if (!form) {
            return res.status(404).json({message: "Formulaire non trouvé"})
        }
        return res.json({form})
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Une erreur interne est survenue"})
    }
})

formRouter.post('/add', async(req, res) => {
    try {
        const {name, surname, email, message} = req.body
        // Pas de vérification
        console.log(name, surname, email, message)
        const new_form = await db.createForm(name, surname, email, message)
        const message_server = `Le formulaire au nom de ${new_form.name} a bien été créé!`
        return res.status(201).json({message: message_server, form: new_form})
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Une erreur interne est survenue"})
    }
})

formRouter.put('/edit/:id', async(req, res) => {
    try {
        const id = parseInt(req.params.id)

        const {name, surname, email, message} = req.body

        const updated_form = await db.updateForm(id, name, surname, email, message)

        return res.json({message: "Formulaire mis à jour", form: {updated_form}  })

    } catch {
        res.status(500).json({message: "Une erreur interne est survenue"})
    }
})

formRouter.delete('/delete/:id', async(req, res) => {
    try {
        const id = parseInt(req.params.id)

        const result = await db.deleteForm(id)

        if (result.success) {
            return res.json({message: "Formulaire supprimé"})
        } else {
            return res.status(404).json({message: "Formulaire non trouvé"})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Une erreur interne est survenue"})
    }
})


export default formRouter