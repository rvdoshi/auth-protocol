import { z } from "zod";

export const usernameSchema =
z
.string()

.min(
3,
"Username must be at least 3 characters"
)

.max(
20,
"Username too long"
);

export const emailIDSchema =
z
.string()

.email(
"Valid email is required"
);

export const loginUsernameSchema =
z
.string()

.min(
1,
"Username required"
);

export const passwordSchema =
z
.string()

.min(
6,
"Password must be at least 6 characters"
)

.max(
50,
"Password too long"
);

export const registerSchema =
z
.object({

username:
usernameSchema,

email:
emailIDSchema
.optional(),

emailID:
emailIDSchema
.optional(),

password:
passwordSchema,

})
.refine(
(data)=>data.email || data.emailID,
{
message:"Email is required",
path:["email"]
}
)
.transform(
(data)=>({
...data,
email:data.email || data.emailID
})
);

export const loginSchema =
z.object({

username:
loginUsernameSchema,

password:
z
.string()

.min(
1,
"Password required"
),

});
