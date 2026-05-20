import { detectResponseType } from "@/utils/response-detector";
import { WeatherRenderer } from "@/components/renderers/WeatherRenderer";
import { ImageRenderer } from "@/components/renderers/ImageRenderer";
import { JokeRenderer } from "@/components/renderers/JokeRenderer";
import { TableRenderer } from "@/components/renderers/TableRenderer";
import { JSONRenderer } from "@/components/renderers/JSONRenderer";
import type { CommunityApi } from "@/data/community-apis";

type ResponseRendererProps = {
  data: any;
  api: CommunityApi;
  intentName: string;
};

export function ResponseRenderer({
  data,
  api,
  intentName,
}: ResponseRendererProps) {
  const responseType = detectResponseType(data, intentName);

  switch (responseType) {
    case "weather":
      return <WeatherRenderer data={data} />;
    case "image":
      return <ImageRenderer data={data} />;
    case "joke":
      return <JokeRenderer data={data} />;
    case "table":
      return <TableRenderer data={data} />;
    case "json":
    default:
      return <JSONRenderer data={data} title={`${api.name} Response`} />;
  }
}
