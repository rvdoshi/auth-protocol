const dbQueries = {

createUser:`

INSERT INTO
"Users"

(

"Username",

"Email",

"PasswordHash"

)

VALUES

(

$1,

$2,

$3

)

RETURNING *;

`,

getUserByUsername:`

SELECT *

FROM "Users"

WHERE

"Username"=$1;

`,

getUserById:`

SELECT *

FROM "Users"

WHERE

"Id"=$1;

`,

// updateRefreshToken:`

// UPDATE
// "Users"

// SET

// "RefreshToken"=$1

// WHERE

// "Id"=$2;

// `,

// getUserByRefreshToken:`

// SELECT *

// FROM "Users"

// WHERE

// "RefreshToken"=$1;

// `,

createMfaCode:`

INSERT INTO
"MfaCodes"

(

"UserId",

"Code",

"ExpiresAt"

)

VALUES

(

$1,

$2,

$3

);

`,

getValidMfa:`

SELECT *

FROM
"MfaCodes"

WHERE

"UserId"=$1

AND

"Used"=FALSE

AND

"ExpiresAt" > NOW()

ORDER BY
"CreatedAt"

DESC

LIMIT 1;

`,

markMfaUsed:`

UPDATE
"MfaCodes"

SET

"Used"=TRUE

WHERE

"Id"=$1;

`,

removeRefreshToken:`

UPDATE
"Users"

SET

"RefreshToken"=NULL

WHERE

"RefreshToken"=$1;

`,

createPasswordResetToken:`

INSERT INTO
"PasswordResetTokens"

(

"UserId",

"TokenHash",

"ExpiresAt"

)

VALUES

(

$1,

$2,

$3

);

`,

getPasswordResetToken:`

SELECT *

FROM
"PasswordResetTokens"

WHERE

"UserId"=$1

AND

"Used"=FALSE

AND

"ExpiresAt" > NOW()

ORDER BY
"CreatedAt"

DESC

LIMIT 1;

`,

markPasswordResetUsed:`

UPDATE
"PasswordResetTokens"

SET

"Used"=TRUE

WHERE

"Id"=$1;

`,

updatePassword:`

UPDATE
"Users"

SET

"PasswordHash"=$1

WHERE

"Id"=$2;

`,

getUserByEmail:`

SELECT *

FROM
"Users"

WHERE

"Email"=$1;

`,

incrementFailedAttempts:`

UPDATE
"Users"

SET

"FailedAttempts"
=
"FailedAttempts"+1

WHERE

"Id"=$1

RETURNING *;

`,

lockUser:`

UPDATE
"Users"

SET

"LockedUntil"=$1

WHERE

"Id"=$2;

`,

resetLoginAttempts:`

UPDATE
"Users"

SET

"FailedAttempts"=0,

"LockedUntil"=NULL

WHERE

"Id"=$1;

`,

createRefreshToken:`

INSERT INTO
"RefreshTokens"

(

"UserId",

"TokenHash",

"ExpiresAt"

)

VALUES

(

$1,

$2,

$3

)

RETURNING *;

`,

getUserRefreshTokens:`

SELECT *

FROM
"RefreshTokens"

WHERE

"UserId"=$1

AND

"Revoked"=FALSE

AND

"ExpiresAt" > NOW();

`,

getRefreshTokensForVerification:`

SELECT *

FROM
"RefreshTokens"

WHERE

"ExpiresAt" > NOW();

`,

revokeRefreshToken:`

UPDATE
"RefreshTokens"

SET

"Revoked"=TRUE

WHERE

"Id"=$1;

`,

revokeAllUserTokens:`

UPDATE
"RefreshTokens"

SET

"Revoked"=TRUE

WHERE

"UserId"=$1;

`,

};


export default dbQueries;
