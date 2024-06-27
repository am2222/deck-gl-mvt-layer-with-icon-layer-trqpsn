import axios from 'axios';

export default {
  async fetchMVTTemplate (sql, options, auth) {
    const data = await this.createMap(sql, options, auth);
    const stats = data.metadata.layers[0].meta.stats;
    const urlData = data.metadata.url.vector;
    let urls = [urlData.urlTemplate];
    if (urlData.subdomains.length > 0) {
      urls = urlData.subdomains.map(s => urlData.urlTemplate.replace('{s}', s));
    }
    return { urls, stats };
  },
  async createMap (sql, options = {}, auth) {
    const config = {
      layers: [{
        type: 'mapnik',
        options: {
          sql,
          vector_extent: 2048,
          vector_simplify_extent: 2048,
          metadata: {
            geometryType: true
          },
          ...options
        }
      }]
    };

    return await this.makeMapsApiRequest(config, auth);
  },
  makeMapsApiRequest (config, auth = {}) {
    const user = 'public'
    const host = 'https://{user}.carto.com'
    let url = `${host.replace('{user}', user)}/api/v1/map?`;
    const getUrl = `${url}client=vl-1.4.4&config=${JSON.stringify(config)}`;
    if (getUrl.length > 1024) {
      return axios.post(url, config).then(res => res.data);
    } else {
      return axios.get(getUrl).then(res => res.data);
    }
  }
}
