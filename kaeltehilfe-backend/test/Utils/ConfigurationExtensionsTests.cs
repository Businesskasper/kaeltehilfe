using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Moq;
using NUnit.Framework;

namespace kaeltehilfe_backend.Tests.Utils
{
    [TestFixture]
    public class ConfigurationExtensionsTests
    {
        [Test]
        public void RequireResolvedPath_ReturnsAbsolute_WhenAlreadyRooted()
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["my:path"] = "/absolute/path"
                })
                .Build();

            var envMock = new Mock<IHostEnvironment>();
            envMock.SetupGet(e => e.ContentRootPath).Returns("/ignored");

            var result = config.RequireResolvedPath("my:path", envMock.Object);
            Assert.AreEqual("/absolute/path", result);
        }

        [Test]
        public void RequireResolvedPath_ResolvesRelative_ToContentRoot()
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["my:path"] = "relative/file.txt"
                })
                .Build();

            var envMock = new Mock<IHostEnvironment>();
            envMock.SetupGet(e => e.ContentRootPath).Returns("/app/root");

            var expected = Path.GetFullPath("relative/file.txt", "/app/root");
            var result = config.RequireResolvedPath("my:path", envMock.Object);
            Assert.AreEqual(expected, result);
        }

        [Test]
        public void RequireResolvedPath_Throws_WhenMissing()
        {
            var config = new ConfigurationBuilder().Build();
            var envMock = new Mock<IHostEnvironment>();
            envMock.SetupGet(e => e.ContentRootPath).Returns("/app");

            Assert.Throws<Exception>(() => config.RequireResolvedPath("my:path", envMock.Object));
        }
    }
}
