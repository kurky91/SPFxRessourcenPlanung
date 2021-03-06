import { Environment, EnvironmentType } from "@microsoft/sp-core-library";
import {
  SPHttpClient,
  SPHttpClientResponse,
  ISPHttpClientOptions
} from '@microsoft/sp-http';


import { ISPResponse } from "../providers/ResourcenPlanDatenList/ISPResponse";
import IListEntry from "../providers/ResourcenPlanDatenList/IListEntry";

export class ListManager {
  private context: any;
  private readonly BASEURL;
  private readonly LISTURL;

  constructor(context, baseUrl, listUrl) {
    this.context = context;
    this.BASEURL = baseUrl;
    this.LISTURL = listUrl;
  }

  //gets all list entries of provided user e-mail address
  public getListDataForUser(user: string): Promise<ISPResponse> {
    return this.context.spHttpClient.fetch(this.BASEURL + `/_api/web/lists/GetByTitle('${this.LISTURL}')/items?$select=Title,PlanMinuten,IstMinuten,ProjectSpaceRelativeUrl,JiraAbsoluteUrl,WochenDatum,User/EMail&$expand=User&$filter=User/EMail eq '${user}'`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  public getListDataForProjectAndThisWeek(projectCode: string, week: Date): Promise<ISPResponse> {
    return this.context.spHttpClient.fetch(this.BASEURL + `/_api/web/lists/GetByTitle('${this.LISTURL}')/items?$select=User/EMail,User/Title&$expand=User&$filter=(WochenDatum eq '${week.toString()}' and Title eq '${projectCode}')`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }


  public getListData(): Promise<ISPResponse> {
    return this.context.spHttpClient.fetch(this.BASEURL + `/_api/web/lists/GetByTitle('${this.LISTURL}')/items`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _saveListData(newItem) {
    if (Environment.type === EnvironmentType.Local) {
      return;
    }

    const spOpts: ISPHttpClientOptions = {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=verbose',
        'odata-version': ''
      },
      body: `{
        '__metadata': {
          'type': 'SP.Data.PizzaMeetingSuggestionsListItem'
        },
        Title:  '${newItem.title}',
        Description: '${newItem.description}'
      }`
    };
    this.context.spHttpClient.post(
      this.context.pageContext.web.absoluteUrl + `/_api/web/lists/GetByTitle('PizzaMeetingSuggestions')/items`,
      SPHttpClient.configurations.v1, spOpts).then((response: SPHttpClientResponse) => {
        // Access properties of the response object.
        console.log(`Status code: ${response.status}`);
        console.log(`Status text: ${response.statusText}`);

        //response.json() returns a promise so you get access to the json in the resolve callback.
        response.json().then((responseJSON: JSON) => {
          console.log(responseJSON);
        });
      });
  }
}
