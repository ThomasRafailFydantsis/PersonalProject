using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (operation.OperationId == null || !operation.OperationId.ToLower().Contains("upload"))
            return;

        operation.Parameters.Clear();
        operation.RequestBody = new OpenApiRequestBody
        {
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties =
                    {
                        ["file"] = new OpenApiSchema
                        {
                            Type = "string",
                            Format = "binary"
                        },
                        ["certId"] = new OpenApiSchema
                        {
                            Type = "integer",
                            Format = "int32"
                        }
                    }
                    }
                }
            }
        };
    }
}