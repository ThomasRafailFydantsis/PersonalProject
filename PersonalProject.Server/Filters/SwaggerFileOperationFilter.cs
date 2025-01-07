using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PersonalProject.Server.Filters
{
public class FileUploadOperationFilter : IOperationFilter
{
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Check if the endpoint contains parameters with the [FromForm] attribute
            var formParams = context.MethodInfo
                .GetParameters()
                .Where(p => p.GetCustomAttributes(typeof(FromFormAttribute), false).Any());

            if (formParams.Any())
            {
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["multipart/form-data"] = new OpenApiMediaType
                        {
                            Schema = new OpenApiSchema
                            {
                                Type = "object",
                                Properties = formParams.ToDictionary(
                                    param => param.Name,
                                    param => param.ParameterType == typeof(IFormFile)
                                        ? new OpenApiSchema { Type = "string", Format = "binary" }
                                        : new OpenApiSchema { Type = "string" }
                                ),
                                Required = (ISet<string>)formParams.Select(p => p.Name).ToList()
                            }
                        }
                    }
                };
            }
        }
    }
}