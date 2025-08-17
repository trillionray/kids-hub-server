const Misc = require("../models/Miscellaneous");

module.exports.addMisc = async (req, res) =>{
    // Creating Object
    let newMisc = new Misc ({
        name: req.body.name,
        price: req.body.price,
        effective_date:req.body.effective_date,
        is_active:req.body.is_active,
        created_by:req.body.created_by,
        last_updated_by:req .body.last_updated_by
    })

    
    Misc.findOne({ name: req.body.name })
    .then((existingMisc) => {
        if (existingMisc) {
            return res.status(409).send({ message: "This Miscellaneous already exists." });
        } else {
            return newMisc.save() // Saving the object in database
            .then((result) =>
                res.status(201).send({
                    success: true,
                    message: "Miscellaneous added successfully",
                    result: result,
                })
            )
            .catch((error) => res.send(error));
        }
    })
    .catch((error) => res.send(error));
}

module.exports.readMisc = async (req, res) =>{
    try {
        const miscList = await Misc.find(); // Fetch all tasks
        res.status(200).json(miscList);     // Send as JSON
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch Miscellaneous", error });
    }
}

module.exports.updateMisc = async (req, res) =>{ //687fbf88690f541009735eca
    try {
        const id = req.params.id;
        const {
            name,
            price, 
            effective_date,
            is_active,
            created_by,
            last_updated_by
        } = req.body

        // Update the task
        const updatedMisc = await Misc.findByIdAndUpdate(
            id,
            { 
                name,
                price, 
                effective_date,
                is_active,
                created_by,
                last_updated_by
            },
            { 
                new: true, 
                runValidators: true 
            }
        );
        
        if (!updatedMisc) {
            return res.status(404).json({ message: "Miscellaneous not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Miscellaneous updated successfully",
            result: updatedMisc
        });
    } catch (error) {
          return res.status(500).json({ message: "Something is wrong cannot be update." });
    }
}

module.exports.deleteMisc = async (req, res) =>{ //687fbf88690f541009735eca
    try {
        const id = req.params.id;

        // Delete the task
        const deleteMisc = await Misc.findByIdAndDelete(id);

        if (!deleteMisc) {
            return res.status(404).json({ message: "Miscellaneous not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Miscellaneous deleted successfully",
            result: deleteMisc
        });
    } catch (error) {
          return res.status(500).json({ message: "Something is wrong cannot be update." });
    }
}

module.exports.getSpecificMiscs = async (req, res) => {
    try {
        const { ids } = req.body; // expecting array of IDs

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Please provide an array of IDs." });
        }

        // Fetch only the `name` field
        const miscs = await Misc.find(
            { _id: { $in: ids } },
            { name: 1, _id: 0 } // project only `name`, exclude `_id`
        );

        if (!miscs || miscs.length === 0) {
            return res.status(404).json({ message: "No Miscellaneous records found." });
        }

        // Map to plain array of names
        const names = miscs.map(misc => misc.name);

        return res.status(200).json({
            success: true,
            count: names.length,
            names: names
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch specific Miscellaneous names.", error });
    }
};


