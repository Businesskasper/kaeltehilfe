using AutoMapper;
using Castle.Components.DictionaryAdapter.Xml;
using Castle.Core.Logging;
using FluentValidation;
using FluentValidation.Results;
using kaeltehilfe_backend.Features.Goods;
using kaeltehilfe_backend.Infrastructure.Database;
using kaeltehilfe_backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

[TestFixture]
public class GoodsControllerTest
{
    private GoodsController _controller;
    private KbContext _kbContext;
    private Mock<ILogger<GoodsController>> _logger;
    private Mock<IMapper> _mapperMock;

    [SetUp]
    public void SetUp()
    {
        _kbContext = new TestingKbContext();
        _mapperMock = new Mock<IMapper>();
        _logger = new Mock<ILogger<GoodsController>>();

        _controller = new GoodsController(_logger.Object, _kbContext, _mapperMock.Object);
    }

    [Test]
    public async Task Goods_Create_Returns_CreatedAtActionCreate()
    {
        // Arrange
        var goodDto = new GoodCreateDto { Name = "Test Good" };
        var good = new Good { Name = "Test Good" };

        _validatorMock
            .Setup(v => v.Validate(It.IsAny<GoodCreateDto>()))
            .Returns(new ValidationResult());
        _mapperMock.Setup(m => m.Map<Good>(It.IsAny<GoodCreateDto>())).Returns(good);

        // Act
        var result = await _controller.Create(goodDto);

        // Assert
        Assert.IsInstanceOf<CreatedAtActionResult>(result);
        var createdAtActionResult = result as CreatedAtActionResult;
        Assert.That(createdAtActionResult?.ActionName, Is.EqualTo("Get"));
        Assertions.AssertProperty<int>(
            createdAtActionResult?.Value,
            "id",
            value =>
            {
                Assert.Greater(value, 0);
            }
        );
    }

    [TearDownAttribute]
    public void Dispose()
    {
        _kbContext.Dispose();
    }
}
