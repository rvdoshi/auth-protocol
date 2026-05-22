const validateRequest = (schema) => {

    return (
        req,
        res,
        next
    ) => {

        try {

            req.body =
            schema.parse(
                req.body
            );

            next();

        }
        catch (error) {

            console.log(error);

            return res
                .status(400)
                .json({

                    success:false,

                    message:
                    "Validation failed",

                    errors:
                    error.issues?.map(
                        (item)=>({

                            field:
                            item.path.join("."),

                            message:
                            item.message

                        })
                    ) || []

                });

        }

    };

};

export default validateRequest;
