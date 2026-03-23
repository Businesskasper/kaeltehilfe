using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Moq;
using NUnit.Framework;

namespace kaeltehilfe_backend.Tests.Utils
{
    [TestFixture]
    public class ConfigurationExtensionsTests
    {
        private static readonly bool IsWindows = RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
        private static string AbsolutePath => IsWindows ? @"C:\absolute\path" : "/absolute/path";
        private static string ContentRoot => IsWindows ? @"C:\app\root" : "/app/root";

        [Test]
        public void RequireResolvedPath_ReturnsAbsolute_WhenAlreadyRooted()
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["my:path"] = AbsolutePath
                })
                .Build();

            var envMock = new Mock<IHostEnvironment>();
            envMock.SetupGet(e => e.ContentRootPath).Returns(ContentRoot);

            var result = config.RequireResolvedPath("my:path", envMock.Object);
            Assert.That(result, Is.EqualTo(AbsolutePath));
        }

        [Test]
        public void RequireResolvedPath_ResolvesRelative_ToContentRoot()
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["my:path"] = "relative/file.txt"
                })
                .Build();

            var envMock = new Mock<IHostEnvironment>();
            envMock.SetupGet(e => e.ContentRootPath).Returns(ContentRoot);

            var expected = Path.GetFullPath("relative/file.txt", ContentRoot);
            var result = config.RequireResolvedPath("my:path", envMock.Object);
            Assert.That(result, Is.EqualTo(expected));
        }

        [Test]
        public void RequireResolvedPath_Throws_WhenMissing()
        {
            var config = new ConfigurationBuilder().Build();
            var envMock = new Mock<IHostEnvironment>();
            envMock.SetupGet(e => e.ContentRootPath).Returns(ContentRoot);

            Assert.Throws<Exception>(() => config.RequireResolvedPath("my:path", envMock.Object));
        }
    }
}
