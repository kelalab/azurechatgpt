export type RMessage = {
  uuid?: string;
  message?: Message;
  cost?: Number;
  sources?: string[];
  visible?: Boolean;
};

export type Message = {
  content: String;
  role: String;
}

export type Bot = {
  id: string;
  name: string;
  description?: string;
}

export type SourceMeta = {
  filename?: string;
  source_id?: string;
}

export type Source = {
  blob?: any;
  content: string;
  dataframe: any;
  embedding: any;
  id: string;
  meta: SourceMeta;
  score: Number;
  // TODO: deprecate these at some point if deemed unnecessary
  source?: string;
  'Header 1'?: string;
  'Header 2'?: string;
  'Header 3'?: string;
  'Header 4'?: string;
  'Header 5'?: string;
  'Header 6'?: string;
}