using Microsoft.Data.SqlClient;
using System;
using System.Data;

namespace Student_api.DAL
{ 
    public class CreateParameter
{
    public CreateParameter() { }

    public SqlParameter IntOutputPara(string paramName)
    {
        return new SqlParameter
        {
            DbType = DbType.Int32,
            Direction = ParameterDirection.Output,
            ParameterName = paramName
        };
    }

    public SqlParameter StringOutputPara(string paramName)
    {
        return new SqlParameter
        {
            DbType = DbType.String,
            Size = 300,
            Direction = ParameterDirection.Output,
            ParameterName = paramName
        };
    }

    public SqlParameter IntInputPara(string paramName, int value)
    {
        return new SqlParameter
        {
            DbType = DbType.Int32,
            Direction = ParameterDirection.Input,
            ParameterName = paramName,
            Value = value
        };
    }

    public SqlParameter LongInputPara(string paramName, long value)
    {
        return new SqlParameter
        {
            DbType = DbType.Int64,
            Direction = ParameterDirection.Input,
            ParameterName = paramName,
            Value = value
        };
    }

    public SqlParameter DecimalInputPara(string paramName, decimal value)
    {
        return new SqlParameter
        {
            DbType = DbType.Decimal,
            Direction = ParameterDirection.Input,
            ParameterName = paramName,
            Value = value
        };
    }

    public SqlParameter DoubleInputPara(string paramName, double value)
    {
        return new SqlParameter
        {
            DbType = DbType.Double,
            Direction = ParameterDirection.Input,
            ParameterName = paramName,
            Value = value
        };
    }

    public SqlParameter StringInputPara(string paramName, string value)
    {
        return new SqlParameter
        {
            DbType = DbType.String,
            Direction = ParameterDirection.Input,
            ParameterName = paramName,
            Value = string.IsNullOrEmpty(value) ? DBNull.Value : (object)value
        };
    }

    public SqlParameter DateTimeInputPara(string paramName, DateTime value)
    {
        return new SqlParameter
        {
            DbType = DbType.DateTime,
            Direction = ParameterDirection.Input,
            ParameterName = paramName,
            Value = value
        };
    }
    public SqlParameter DateInputPara(string paramName, DateTime value)
    {
        return new SqlParameter
        {
            DbType = DbType.Date,
            Direction = ParameterDirection.Input,
            ParameterName = paramName,
            Value = value
        };
    }

    public SqlParameter BooleanInputPara(string paramName, bool value)
    {
        return new SqlParameter
        {
            DbType = DbType.Boolean,
            Direction = ParameterDirection.Input,
            ParameterName = paramName,
            Value = value
        };
    }

    public SqlParameter BinaryInputPara(string paramName, byte[] value)
    {
        return new SqlParameter(paramName, SqlDbType.VarBinary)
        {
            Value = value != null ? (object)value : DBNull.Value
        };
    }

    public SqlParameter ImageInputPara(string paramName, byte[] value)
    {
        return new SqlParameter(paramName, SqlDbType.VarBinary)
        {
            Value = value != null ? (object)value : DBNull.Value
        };
    }

    public void AddParameters(SqlCommand cmd, params SqlParameter[] parameters)
    {
        cmd.Parameters.AddRange(parameters);
    }

    public void AddParameter(SqlCommand cmd, SqlParameter parameter)
    {
        cmd.Parameters.Add(parameter);
    }
}
}
