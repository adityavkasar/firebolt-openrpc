#include "gtest/gtest.h"
#include "CoreSDKTest.h"
#include "JsonEngine.hpp"


class MetricsTest : public ::testing::Test {
	protected:
		JsonEngine* jsonEngine;

	void SetUp() override
	{
		jsonEngine = new JsonEngine();
	}

	void TearDown() override
	{
		delete jsonEngine;
	}
};


// TEST_F(MetricsTest, TestMetricsready)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.ready");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().ready(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(MetricsTest, TestMetricssignIn)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.signIn");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().signIn(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(MetricsTest, TestMetricssignOut)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.signOut");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().signOut(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


TEST_F(MetricsTest, TestMetricsStartContent)
{
	Firebolt::Error error = Firebolt::Error::None;
	auto actual_value = jsonEngine->get_value("Metrics.startContent");

	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().startContent("example", &error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, STRING_TO_BOOL(actual_value));
}


TEST_F(MetricsTest, TestMetricsStopContent)
{
	Firebolt::Error error = Firebolt::Error::None;
	auto actual_value = jsonEngine->get_value("Metrics.stopContent");

	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().stopContent("example", &error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, STRING_TO_BOOL(actual_value));
}


// TEST_F(MetricsTest, TestMetricspage)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.page");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().page(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(MetricsTest, TestMetricsaction)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.action");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().action(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(MetricsTest, TestMetricserror)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.error");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().error(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(MetricsTest, TestMetricsmediaLoadStart)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.mediaLoadStart");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().mediaLoadStart(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


TEST_F(MetricsTest, TestMetricsMediaPlay)
{
	Firebolt::Error error = Firebolt::Error::None;
	auto actual_value = jsonEngine->get_value("Metrics.mediaPlay");

	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().mediaPlay("example", &error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, STRING_TO_BOOL(actual_value));
}


TEST_F(MetricsTest, TestMetricsMediaPlaying)
{
	Firebolt::Error error = Firebolt::Error::None;
	std::string actual_value = jsonEngine->get_value("Metrics.mediaPlaying");

	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().mediaPlaying("example", &error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, STRING_TO_BOOL(actual_value));
}


// TEST_F(MetricsTest, TestMetricsmediaPause)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.mediaPause");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().mediaPause(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(MetricsTest, TestMetricsmediaWaiting)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.mediaWaiting");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().mediaWaiting(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(MetricsTest, TestMetricsmediaProgress)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.mediaProgress");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().mediaProgress(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(MetricsTest, TestMetricsmediaSeeking)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.mediaSeeking");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().mediaSeeking(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(MetricsTest, TestMetricsmediaSeeked)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.mediaSeeked");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().mediaSeeked(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(MetricsTest, TestMetricsmediaRateChange)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.mediaRateChange");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().mediaRateChange(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(MetricsTest, TestMetricsmediaRenditionChange)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.mediaRenditionChange");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().mediaRenditionChange(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(MetricsTest, TestMetricsmediaEnded)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Metrics.mediaEnded");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().MetricsInterface().mediaEnded(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }