public static class Assertions
{
    public static void AssertProperty<TValue>(object? anonymousObject, string propertyKey, Action<TValue?> assertion)
    {
        Assert.IsNotNull(anonymousObject);

        var property = anonymousObject.GetType().GetProperty(propertyKey);
        Assert.IsNotNull(property);

        var propertyValue = (TValue?)property.GetValue(anonymousObject);

        assertion(propertyValue);
    }
}