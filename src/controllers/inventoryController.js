const User = require('../../modals/userSchema');
const Item = require('../../modals/itemSchema');
const { fetchItemFromExternalApi } = require('./../api/fetchItemUsingApi');

exports.addItemToInventory = async (req, res) => {
    const { code, count = 1 } = req.body;  // Default count to 1 if not provided
    const user = res.locals.currUser;

    const query = {
        $or: [
            { upc: code },
            { ean: code }
        ]
    };

    let newItem = await Item.findOne(query);

    if (newItem) {
        console.log('Item found in database');
        await addOrUpdateUserItem(user, newItem._id, count);

        return res.status(200).json({
            success: true,
            message: 'Item found in the database and updated in user items',
            item: newItem,
            code
        });
    }

    // Fetch the item from external API if it's not found in the database
    try {
        const body = await fetchItemFromExternalApi(code);

        if (body && body.items && body.items.length > 0) {
            const {
                ean, title, upc, gtin, asin, description, brand, model,
                dimension, weight, category, currency, lowest_recorded_price,
                highest_recorded_price, images
            } = body.items[0];

            newItem = new Item({
                ean, title, upc, gtin, asin, description, brand, model,
                dimension, weight, category, currency, lowest_recorded_price,
                highest_recorded_price, images
            });

            await newItem.save();
            console.log('Stored in the database');

            await addOrUpdateUserItem(user, newItem._id, count);

            return res.status(200).json({
                success: true,
                message: 'Item found using external API, saved to the database, and updated in user items',
                item: newItem,
                code
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Item not found in external API',
                code
            });
        }
    } catch (err) {
        console.error('External API error:', err);

        return res.status(500).json({
            success: false,
            message: 'Error occurred during the external API request',
            error: err.message
        });
    }
};

exports.removeItemFromInventory = async (req, res) => {
    const { code, count = 1 } = req.body;
    const user = res.locals.currUser;

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'User not found in request context',
        });
    }

    // Ensure the user has an items array
    if (!user.items) {
        return res.status(400).json({
            success: false,
            message: 'User does not have an inventory',
        });
    }

    const query = {
        $or: [
            { upc: code },
            { ean: code }
        ]
    };

    let itemToRemove = await Item.findOne(query);

    if (!itemToRemove) {
        return res.status(404).json({
            success: false,
            message: 'Item not found in the database',
            code
        });
    }

    try {
        const result = await removeUserItem(user, itemToRemove._id, count);

        if (result.removed) {
            return res.status(200).json({
                success: true,
                message: 'Item removed from user inventory',
                item: itemToRemove,
                code
            });
        } else if (result.decremented) {
            return res.status(200).json({
                success: true,
                message: `Item count decremented by ${count}`,
                item: itemToRemove,
                code
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Unable to remove item or decrement count',
                code
            });
        }
    } catch (err) {
        console.error('Error during item removal:', err);

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
};


// Helper function to remove or decrement item in user's items array
async function removeUserItem(user, itemId, count) {
    const existingItem = user.items.find(item => item.itemId.equals(itemId));

    if (existingItem) {
        // If the item's count is greater than the decrement count
        if (existingItem.count > count) {
            existingItem.count -= count;  // Decrement the count
            await user.save();
            return { decremented: true };
        } 
        // If the item's count is less than or equal to the decrement count, remove the item
        else {
            user.items = user.items.filter(item => !item.itemId.equals(itemId));
            await user.save();
            return { removed: true };
        }
    } else {
        // Item does not exist in user's inventory
        return { removed: false };
    }
}


// Helper function to add or update item in user's items array
async function addOrUpdateUserItem(user, itemId, count) {
    const existingItem = user.items.find(item => item.itemId.equals(itemId));

    if (existingItem) {
        // Add the count to the existing item's count
        existingItem.count += count;
    } else {
        // If it doesn't exist, add it with the given count
        user.items.push({ itemId, count });
    }

    // Save the updated user
    await user.save();
}
