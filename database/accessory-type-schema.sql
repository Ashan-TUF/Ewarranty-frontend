-- Apply to the eWarranty SQL Server database before deploying Accessory Type API changes.
-- The API generates TypeCode after the first insert, so the column must allow NULL.
IF COL_LENGTH('dbo.ACCESSORY_TYPE', 'TypeCode') IS NULL
    ALTER TABLE dbo.ACCESSORY_TYPE ADD TypeCode nvarchar(50) NULL;
GO

UPDATE dbo.ACCESSORY_TYPE
SET TypeCode = CONCAT('AT', RIGHT(CONCAT('000000', Id), 6))
WHERE TypeCode IS NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.ACCESSORY_TYPE')
      AND name = 'UQ_ACCESSORY_TYPE_CODE'
)
    CREATE UNIQUE INDEX UQ_ACCESSORY_TYPE_CODE
    ON dbo.ACCESSORY_TYPE(TypeCode)
    WHERE TypeCode IS NOT NULL;
GO
