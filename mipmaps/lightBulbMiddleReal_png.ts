/* eslint-disable */
import MipmapElement from '../../phet-core/js/MipmapElement.js';

// The levels in the mipmap. Specify explicit types rather than inferring to assist the type checker, for this boilerplate case.
const mipmaps = [
  new MipmapElement( 195, 315, 'data:image/png;base64,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' ),
  new MipmapElement( 98, 158, 'data:image/png;base64,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' ),
  new MipmapElement( 49, 79, 'data:image/png;base64,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' ),
  new MipmapElement( 25, 40, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAoCAYAAAALz1FrAAAAAklEQVR4AewaftIAAAPcSURBVL3BX2wcdB0A8M/3d9frupVKZ9wwMyZD1If2AYyjYcuZNnEiiMYE4pMY5rYY22kUH4w+NKU8QCRoJFJjjLFqlvlgMGwx9GFpVwPysJD4QCd/AkxFszGKhXWM9Xr342aXbLR3Z4tLP5/Q2m24BVXUsICEgiUFnMPPcU4TobHd6McZPIKa5j6D3TiHB63SAfzQ2n0WD6HP/3Av9nv/SngIZU3sxZD/X8LDuNYyH8EDrp4bcZ9LkiX78DtXz19xAX3qEhISTri6fobb1RXxDTyjiZEv9k8Ih7BPdlC4lXySKBIflvOfR44ce8RKb6GmLmELHtfAyJcGbiZ3yb4lK2Gf7IOyHnxCzpuFz2muiuuKWNTEx7duvqMQacP5hcont3Vf84+/z7659YYtm984+fpcYVt3V+1fc28tlgqF1zV3ArcXMIBpy8yMDh3aVCp9k3xNsZA2dG/qKJy7UNm4rburbe78hY1buzZ1VKq17t5tH9o+OLBjYGzq+LiVTuHzBfThKVeYGR26kfzjas3RqedeefX02fn08pn/zMzOn/fCqdm/zc6//e+XXnvj1dNn5/+5WK0tXveBzpsGB27eODZ1/Kj3ege3JrRbJvNRlDrai0/ieuIxWW8wgS2YxwI2v3Bq9gnilZD7rHQTTidky/QOP3qYeCk4cNene749cnjq+yKuHzly7Lsidoi4S8SXiVtGjhy7l/w20WalMp4tImkofy/zSxG/mhkd2tsz/OiEupHDU4suq2mtC0cTXsQ9lukZHnscg0ERv352dPBOa1dQl3AI2zXQOzz2B/J+VINfzIwO3W31ul2SLKnhYxroGR47nOWvEWfJP5kZHfyC1dmPo+qSJb/HVzXROzw2Sb6HqGbutzqdeEpdsuR5Sz6liZ7hsenMYyF6ZkYHi1rbi5ddklz2U3xFC8Gb5FLOOrV2A8Zdklw2hxM4oIksuyhC1twPMO0KyXv9Ft24QwNBtqRDY3eiiglXSFa6H2X0WYOFxWoJO/Ajy4QGJicn/1itVne3tbVV1EWEiyLXiqlS6cztG+ZEuCgipMrCxsVarVjY0PGbXbt2fd0yRQ1ERGexWNxkuVRQay+IiGtdIZfaFfxXhwaSdZCsg2QdJOsgWQdJYxXvT1UDSWMHUbE270TEQQ0kDQwMDBzEX6xBznly586dT2ggaSIiHsYFq5Bzns85P6CJpIn+/v4jOGZ1Jsrl8pOaSFp7EHNayDm/lnMe1UJBC+Pj4yf37NnzXM55e0RsjYiCuohQt5BzfjoivlMul5/WQlil6enpXRFxW865OyLORMSfyuXycavwLmgAPhMV3lN4AAAAAElFTkSuQmCC' ),
  new MipmapElement( 13, 20, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAUCAYAAABWMrcvAAAAAklEQVR4AewaftIAAAHHSURBVJ3BwUuTYRzA8e/ved9tZSNW4rykMNoO5aCLp3S4BdsOwQgST1INgqij0XUML126GQ6W1/6CHTs4wyCKKGsdhDrsMoZEupcinNvz9MJe9FWLws9HOBAHpgAN9BhQgAU0gTWOmAaK/N0N4CY+Z4G7/FsByOK5BUT5P7dx2YAGtnCVC5kLGP0UJACmC2KA1XKtvsRADwjbgMaTu3zxSWvHmbaU0kHb6hlgJHw6Uq7VlxjYAPIWMAE0GosPrgQtdW9ts9lsOz++t7addmvH2Rofjow+zF+NLK++XQdsIK4AC1eytLwhSnZnJydeikgakRxIfjh86pVAlIEp4I0CFPtMETHXZycvPS7X6rpcq2sOCwFfFNAGsriSpUoDzJzAtcbi/QWOU7gU8AIYw5MsVb4aWMFIjsPmgM+4FAMfgHn2ma6IUXh29/o2EALe4RI81Wp1IRaLzQQCgb7d/RUOONux7ujYp+DOt3Gn0/mZnb8zg8fGk0gkokABVz80hI6eQSC+d26EofPRTXwUJ6A4AcWBJqD5sw4+Ck8mk6kAHzmur7V+ho/CR0QqQA8fY8zrVCq1go/CJ51OV4FHwDrw3hjzHChyxG8gZox0VeVroQAAAABJRU5ErkJggg==' )
];

export default mipmaps;